'use client'

import * as React from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Headphones,
} from 'lucide-react'
import { toNepaliNumerals } from '@/lib/utils/numerals'

interface ArticleAudioPlayerProps {
  title: string
  content: string
  audioUrl?: string | null
  language?: string
}

function extractPlainText(htmlOrText: string): string {
  if (!htmlOrText) return ''
  let text = htmlOrText

  // Remove scripts, styles, iframes, figcaptions
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  text = text.replace(/<figcaption\b[^<]*(?:(?!<\/figcaption>)<[^<]*)*<\/figcaption>/gi, '')

  // Strip all HTML tags
  text = text.replace(/<[^>]+>/g, ' ')

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, ' — ')
    .replace(/&ndash;/g, ' - ')

  // Remove URLs & emails so speech doesn't awkwardly spell out characters
  text = text.replace(/https?:\/\/\S+/gi, '')
  text = text.replace(/[\w.-]+@[\w.-]+\.\w+/gi, '')

  // Remove markdown symbols or hashtags
  text = text.replace(/[#*_~`]/g, '')

  // Normalize whitespace
  return text.replace(/\s+/g, ' ').trim()
}

function formatDuration(totalSeconds: number, language: string): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`
  return language === 'ne' ? toNepaliNumerals(formatted) : formatted
}

export function ArticleAudioPlayer({
  title,
  content,
  audioUrl,
  language = 'ne',
}: ArticleAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [totalDuration, setTotalDuration] = React.useState(0)
  const [playbackRate, setPlaybackRate] = React.useState<number>(1)
  const [isMuted, setIsMuted] = React.useState(false)
  const [isSupported, setIsSupported] = React.useState(true)
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([])

  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const textChunksRef = React.useRef<string[]>([])
  const currentChunkIndexRef = React.useRef<number>(0)
  const activeUtteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null)
  const tickerTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const isSpeechMode = !audioUrl

  // 1. Asynchronous Voice Loading & System Voice Tracking
  React.useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (isSpeechMode) setIsSupported(false)
      return
    }

    setIsSupported(true)

    const updateVoices = () => {
      try {
        const available = window.speechSynthesis.getVoices()
        if (available && available.length > 0) {
          setVoices(available)
        }
      } catch {}
    }

    updateVoices()

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices
    }

    // Secondary delayed check for Chrome background voice initialization
    const timer = setTimeout(updateVoices, 300)

    return () => {
      clearTimeout(timer)
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [isSpeechMode])

  // 2. Prepare Bite-Sized Sentences & Duration Estimation
  React.useEffect(() => {
    if (isSpeechMode) {
      const cleanTitle = extractPlainText(title)
      const plainContent = extractPlainText(content)
      const fullText = `${cleanTitle}। ${plainContent}`

      // Split by Devanagari danda, periods, question marks, exclamation, and newlines
      const rawSentences = fullText
        .split(/([।?!.\n]+)/)
        .reduce<string[]>((acc, part, i, arr) => {
          if (i % 2 === 0 && part.trim()) {
            const punct = arr[i + 1] || ''
            acc.push((part + punct).trim())
          }
          return acc
        }, [])

      // Sub-divide any long clauses (> 120 chars) by commas to prevent browser TTS stalls
      const optimizedChunks: string[] = []
      for (const sent of rawSentences) {
        if (!sent) continue
        if (sent.length <= 120) {
          optimizedChunks.push(sent)
        } else {
          const parts = sent.split(/([,;]+)/).reduce<string[]>((subAcc, subPart, si, subArr) => {
            if (si % 2 === 0 && subPart.trim()) {
              const subPunct = subArr[si + 1] || ''
              subAcc.push((subPart + subPunct).trim())
            }
            return subAcc
          }, [])

          let buffer = ''
          for (const p of parts) {
            if (buffer.length + p.length < 100) {
              buffer += (buffer ? ' ' : '') + p
            } else {
              if (buffer) optimizedChunks.push(buffer)
              buffer = p
            }
          }
          if (buffer) optimizedChunks.push(buffer)
        }
      }

      textChunksRef.current = optimizedChunks.length > 0 ? optimizedChunks : [cleanTitle || 'समाचार']

      // Words-per-minute estimation (~125 wpm for natural broadcast pacing)
      const wordCount = fullText.split(/\s+/).filter(Boolean).length
      const estimatedSecs = Math.max(15, Math.round((wordCount / 125) * 60))
      setTotalDuration(estimatedSecs)
    }
  }, [title, content, isSpeechMode])

  // 3. Cleanup on unmount or navigation
  React.useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel()
        } catch {}
      }
      if (tickerTimerRef.current) {
        clearInterval(tickerTimerRef.current)
      }
    }
  }, [])

  // 4. Smooth Clock & Scrubber Progression
  React.useEffect(() => {
    if (isPlaying && !isPaused) {
      if (tickerTimerRef.current) clearInterval(tickerTimerRef.current)

      tickerTimerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (totalDuration > 0 && prev < totalDuration) {
            const next = prev + 1
            setProgress((next / totalDuration) * 100)
            return next
          }
          return prev
        })
      }, 1000 / playbackRate)
    } else {
      if (tickerTimerRef.current) {
        clearInterval(tickerTimerRef.current)
        tickerTimerRef.current = null
      }
    }

    return () => {
      if (tickerTimerRef.current) {
        clearInterval(tickerTimerRef.current)
      }
    }
  }, [isPlaying, isPaused, totalDuration, playbackRate])

  /**
   * Intelligently selects the best speech voice for Devanagari (Nepali/Hindi)
   * Ensures voice.lang and utterance.lang align so browsers do not reject the voice.
   */
  const resolveSpeechEngineVoice = (): { voice: SpeechSynthesisVoice | null; lang: string } => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return { voice: null, lang: 'ne-NP' }
    }

    const available = voices.length > 0 ? voices : window.speechSynthesis.getVoices() || []

    if (language === 'ne') {
      // 1. Direct native Nepali voice
      const neVoice = available.find((v) => {
        const l = (v.lang || '').toLowerCase()
        return l.startsWith('ne') || l.includes('np')
      })
      if (neVoice) {
        return { voice: neVoice, lang: neVoice.lang || 'ne-NP' }
      }

      // 2. Hindi Devanagari voice (Identical Devanagari script, reads Nepali with 98% phonetic perfection)
      const hiVoice = available.find((v) => {
        const l = (v.lang || '').toLowerCase()
        return l.startsWith('hi') || l.includes('in')
      })
      if (hiVoice) {
        return { voice: hiVoice, lang: hiVoice.lang || 'hi-IN' }
      }

      // 3. Indian / South Asian Devanagari voice by name (Google हिन्दी, Microsoft Hemant/Kalpana/Swara, etc.)
      const namedIndicVoice = available.find((v) =>
        /hindi|india|nepal|swara|kalpana|hemant|madhur|lekha/i.test(v.name)
      )
      if (namedIndicVoice) {
        return { voice: namedIndicVoice, lang: namedIndicVoice.lang || 'hi-IN' }
      }

      // 4. Any Indian locale voice (e.g. en-IN or mr-IN)
      const indicLocaleVoice = available.find((v) => (v.lang || '').toLowerCase().includes('in'))
      if (indicLocaleVoice) {
        return { voice: indicLocaleVoice, lang: indicLocaleVoice.lang || 'hi-IN' }
      }
    } else {
      // English article voice
      const enVoice = available.find((v) => (v.lang || '').toLowerCase().startsWith('en'))
      if (enVoice) {
        return { voice: enVoice, lang: enVoice.lang || 'en-US' }
      }
    }

    // Default system fallback
    const fallback = available.find((v) => v.default) || available[0] || null
    return {
      voice: fallback,
      // For Devanagari text, never pass an English tag if no Nepali exists; use 'hi-IN' for Devanagari phonetics
      lang: language === 'ne' ? (fallback?.lang?.startsWith('hi') ? fallback.lang : 'hi-IN') : 'en-US',
    }
  }

  const speakChunk = (chunkIndex: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const chunks = textChunksRef.current
    if (chunkIndex >= chunks.length) {
      setIsPlaying(false)
      setIsPaused(false)
      currentChunkIndexRef.current = 0
      setProgress(100)
      setCurrentTime(totalDuration)
      return
    }

    try {
      window.speechSynthesis.cancel()
    } catch {}

    const chunkText = chunks[chunkIndex]
    const utterance = new SpeechSynthesisUtterance(chunkText)
    const { voice, lang } = resolveSpeechEngineVoice()

    if (voice) {
      utterance.voice = voice
    }
    utterance.lang = lang
    utterance.rate = playbackRate
    utterance.volume = isMuted ? 0 : 1

    // Store in ref AND window to prevent Chrome V8 garbage collection mid-speech bug
    activeUtteranceRef.current = utterance
    if (typeof window !== 'undefined') {
      ;(window as any).__sabaichha_tts = utterance
    }

    utterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      const nextIndex = chunkIndex + 1
      currentChunkIndexRef.current = nextIndex

      if (chunks.length > 0) {
        const chunkProgress = (nextIndex / chunks.length) * 100
        setProgress(chunkProgress)
      }

      if (nextIndex < chunks.length) {
        speakChunk(nextIndex)
      } else {
        setIsPlaying(false)
        setIsPaused(false)
        currentChunkIndexRef.current = 0
        setProgress(100)
        setCurrentTime(totalDuration)
      }
    }

    utterance.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') return
      console.warn('SpeechSynthesis playback event:', e.error)
      // Attempt next chunk automatically instead of dying completely
      const nextIndex = chunkIndex + 1
      currentChunkIndexRef.current = nextIndex
      if (nextIndex < chunks.length) {
        setTimeout(() => speakChunk(nextIndex), 100)
      } else {
        setIsPlaying(false)
        setIsPaused(false)
      }
    }

    // Chrome resume check to unfreeze stalled audio engines
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }

    window.speechSynthesis.speak(utterance)
  }

  const handlePlayPause = () => {
    if (isSpeechMode) {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

      if (isPlaying && !isPaused) {
        // Smooth Pause: cancel audio output and preserve chunk index position
        try {
          window.speechSynthesis.cancel()
        } catch {}
        setIsPlaying(false)
        setIsPaused(true)
      } else {
        // Play / Resume
        setIsPlaying(true)
        setIsPaused(false)
        speakChunk(currentChunkIndexRef.current)
      }
    } else {
      if (!audioRef.current) return
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
        setIsPaused(true)
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true)
          setIsPaused(false)
        }).catch(() => {})
      }
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newPercent = Math.max(0, Math.min(100, (clickX / rect.width) * 100))
    setProgress(newPercent)

    const newCurrentTime = Math.round((newPercent / 100) * totalDuration)
    setCurrentTime(newCurrentTime)

    if (isSpeechMode) {
      const chunks = textChunksRef.current
      if (chunks.length > 0) {
        const targetIndex = Math.min(
          chunks.length - 1,
          Math.floor((newPercent / 100) * chunks.length)
        )
        currentChunkIndexRef.current = targetIndex

        if (isPlaying) {
          speakChunk(targetIndex)
        }
      }
    } else if (audioRef.current && totalDuration > 0) {
      audioRef.current.currentTime = (newPercent / 100) * totalDuration
    }
  }

  const handleToggleMute = () => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    if (audioRef.current) {
      audioRef.current.muted = nextMuted
    }
    if (isSpeechMode && isPlaying && !isPaused) {
      speakChunk(currentChunkIndexRef.current)
    }
  }

  const handleCycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 0.85]
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length
    const nextSpeed = speeds[nextIndex]
    setPlaybackRate(nextSpeed)

    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed
    }
    if (isSpeechMode && isPlaying && !isPaused) {
      speakChunk(currentChunkIndexRef.current)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <div className="w-full my-4">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setTotalDuration(audioRef.current.duration || 0)
            }
          }}
          onTimeUpdate={() => {
            if (audioRef.current && totalDuration > 0) {
              const cur = audioRef.current.currentTime
              setCurrentTime(cur)
              setProgress((cur / totalDuration) * 100)
            }
          }}
          onEnded={() => {
            setIsPlaying(false)
            setIsPaused(false)
            setProgress(100)
          }}
        />
      )}

      {/* Slim, elegant single-row audio player */}
      <div className="flex flex-col gap-1.5 max-w-xl">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium px-1">
          <span className="flex items-center gap-1.5">
            <Headphones className={`w-3.5 h-3.5 ${isPlaying && !isPaused ? 'text-red-600 animate-pulse' : 'text-slate-600 dark:text-slate-400'}`} />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {language === 'ne' ? 'यो समाचार सुन्नुहोस्' : 'Listen to this article'}
            </span>

            {/* Subtle animated audio waves when active */}
            {isPlaying && !isPaused && (
              <span className="inline-flex items-center gap-0.5 ml-1">
                <span className="w-0.5 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-0.5 h-3 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-0.5 h-2 bg-red-600 rounded-full animate-bounce" />
              </span>
            )}
          </span>

          <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 font-bold" suppressHydrationWarning>
            {formatDuration(currentTime, language)} / {formatDuration(totalDuration, language)}
          </span>
        </div>

        <div className="h-11 sm:h-12 px-3 sm:px-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/60 flex items-center gap-3 sm:gap-3.5 shadow-2xs">
          {/* Circular Play / Pause Button */}
          <button
            type="button"
            onClick={handlePlayPause}
            aria-label={isPlaying && !isPaused ? 'Pause' : 'Play'}
            title={isPlaying && !isPaused ? (language === 'ne' ? 'रोक्नुहोस्' : 'Pause') : (language === 'ne' ? 'सुन्नुहोस्' : 'Play')}
            className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-all duration-150 shrink-0 cursor-pointer shadow-2xs ${
              isPlaying && !isPaused
                ? 'border-red-600 bg-red-600 text-white hover:bg-red-700'
                : 'border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 hover:scale-105 active:scale-95'
            }`}
          >
            {isPlaying && !isPaused ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          {/* Scrubber Track Line */}
          <div
            onClick={handleSeek}
            className="relative flex-1 h-6 flex items-center cursor-pointer group select-none"
            title={language === 'ne' ? 'अगाडि वा पछाडि सार्नुहोस्' : 'Seek'}
          >
            <div className="w-full h-1 rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden relative transition-all group-hover:h-1.5">
              <div
                className={`h-full rounded-full transition-[width] duration-200 ease-out ${
                  isPlaying && !isPaused ? 'bg-red-600' : 'bg-slate-900 dark:bg-slate-200'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full shadow-2xs transition-transform duration-100 group-hover:scale-125 pointer-events-none ${
                isPlaying && !isPaused ? 'bg-red-600 ring-2 ring-red-300 dark:ring-red-900' : 'bg-slate-900 dark:bg-slate-100'
              }`}
              style={{ left: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>

          {/* Speed Toggle */}
          <button
            type="button"
            onClick={handleCycleSpeed}
            title={language === 'ne' ? 'गति परिवर्तन' : 'Speed'}
            className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition shrink-0 cursor-pointer"
          >
            {playbackRate}x
          </button>

          {/* Volume / Mute Button */}
          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            title={isMuted ? (language === 'ne' ? 'ध्वनि अन गर्नुहोस्' : 'Unmute') : (language === 'ne' ? 'ध्वनि बन्द गर्नुहोस्' : 'Mute')}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition shrink-0 cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-500" />
            ) : (
              <Volume2 className="w-4 h-4 fill-current" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
