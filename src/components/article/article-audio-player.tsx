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
  if (typeof document !== 'undefined') {
    const tmp = document.createElement('div')
    tmp.innerHTML = htmlOrText
    const unwanted = tmp.querySelectorAll('script, style, iframe, figure, figcaption')
    unwanted.forEach((el) => el.remove())
    return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim()
  }
  return htmlOrText
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
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

  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const textChunksRef = React.useRef<string[]>([])
  const currentChunkIndexRef = React.useRef<number>(0)
  const keepAliveTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const isSpeechMode = !audioUrl

  // Prepare text chunks
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    if (isSpeechMode) {
      if (!('speechSynthesis' in window)) {
        setIsSupported(false)
        return
      }
      setIsSupported(true)

      const plainContent = extractPlainText(content)
      const fullText = `${title}. ${plainContent}`

      const rawSentences = fullText
        .split(/([।?!.\n]+)/)
        .reduce<string[]>((acc, part, i, arr) => {
          if (i % 2 === 0 && part.trim()) {
            const punct = arr[i + 1] || ''
            acc.push((part + punct).trim())
          }
          return acc
        }, [])

      const mergedChunks: string[] = []
      let currentBuffer = ''

      for (const sent of rawSentences) {
        if (!sent) continue
        if (currentBuffer.length + sent.length < 160) {
          currentBuffer += (currentBuffer ? ' ' : '') + sent
        } else {
          if (currentBuffer) mergedChunks.push(currentBuffer)
          currentBuffer = sent
        }
      }
      if (currentBuffer) mergedChunks.push(currentBuffer)

      textChunksRef.current = mergedChunks.length > 0 ? mergedChunks : [title]

      const wordCount = fullText.split(/\s+/).filter(Boolean).length
      const estimatedSecs = Math.max(15, Math.round((wordCount / 125) * 60))
      setTotalDuration(estimatedSecs)
    }
  }, [title, content, isSpeechMode])

  // Stop playback on unmount or route change
  React.useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      if (keepAliveTimerRef.current) {
        clearInterval(keepAliveTimerRef.current)
      }
    }
  }, [])

  const startKeepAlive = () => {
    if (keepAliveTimerRef.current) clearInterval(keepAliveTimerRef.current)
    keepAliveTimerRef.current = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause()
          window.speechSynthesis.resume()
        }
      }
    }, 10000)
  }

  const stopKeepAlive = () => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current)
      keepAliveTimerRef.current = null
    }
  }

  const getPreferredVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
    const voices = window.speechSynthesis.getVoices()
    if (!voices || voices.length === 0) return null

    const neVoice = voices.find(
      (v) => v.lang.startsWith('ne') || v.lang.includes('NP')
    )
    if (neVoice) return neVoice

    const hiVoice = voices.find(
      (v) => v.lang.startsWith('hi') || v.lang.includes('IN')
    )
    if (hiVoice) return hiVoice

    return voices.find((v) => v.default) || voices[0] || null
  }

  const speakChunk = (chunkIndex: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const chunks = textChunksRef.current
    if (chunkIndex >= chunks.length) {
      setIsPlaying(false)
      setIsPaused(false)
      currentChunkIndexRef.current = 0
      setProgress(100)
      stopKeepAlive()
      return
    }

    window.speechSynthesis.cancel()

    const chunkText = chunks[chunkIndex]
    const utterance = new SpeechSynthesisUtterance(chunkText)
    const voice = getPreferredVoice()
    if (voice) utterance.voice = voice
    utterance.lang = language === 'ne' ? 'ne-NP' : 'en-US'
    utterance.rate = playbackRate
    utterance.volume = isMuted ? 0 : 1

    utterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      const nextIndex = chunkIndex + 1
      currentChunkIndexRef.current = nextIndex

      const pct = (nextIndex / chunks.length) * 100
      setProgress(pct)
      setCurrentTime(Math.round((pct / 100) * totalDuration))

      if (nextIndex < chunks.length) {
        speakChunk(nextIndex)
      } else {
        setIsPlaying(false)
        setIsPaused(false)
        currentChunkIndexRef.current = 0
        setProgress(100)
        stopKeepAlive()
      }
    }

    utterance.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') return
      setIsPlaying(false)
      setIsPaused(false)
      stopKeepAlive()
    }

    window.speechSynthesis.speak(utterance)
  }

  const handlePlayPause = () => {
    if (!audioUrl) {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

      if (isPlaying && !isPaused) {
        window.speechSynthesis.pause()
        setIsPaused(true)
        stopKeepAlive()
      } else if (isPaused) {
        window.speechSynthesis.resume()
        setIsPaused(false)
        startKeepAlive()
      } else {
        startKeepAlive()
        speakChunk(currentChunkIndexRef.current)
      }
    } else {
      if (!audioRef.current) return
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true)
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
    const speeds = [1, 1.25, 1.5]
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
            setProgress(100)
          }}
        />
      )}

      {/* Slim, elegant single-row audio player matching user reference screenshot */}
      <div className="flex flex-col gap-1.5 max-w-xl">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium px-1">
          <span className="flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>{language === 'ne' ? 'यो समाचार सुन्नुहोस्' : 'Listen to this article'}</span>
          </span>
          <span className="font-mono text-[10px]" suppressHydrationWarning>
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
            className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full border border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 flex items-center justify-center transition-all duration-150 shrink-0 cursor-pointer hover:scale-105 active:scale-95 shadow-2xs"
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
                className="h-full bg-slate-900 dark:bg-slate-200 rounded-full transition-[width] duration-150 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-slate-100 shadow-2xs transition-transform duration-100 group-hover:scale-125 pointer-events-none"
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
