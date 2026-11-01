'use client'

import * as React from 'react'
import { useLanguage } from '@/context/language-context'
import {
  Radio,
  Clock,
  RefreshCw,
  Bell,
  Sparkles,
  ChevronDown,
  User,
} from 'lucide-react'

interface LiveUpdateItem {
  id: string
  headline: string
  content: string
  createdAt: string
  author: {
    fullName: string
    avatarUrl?: string | null
  }
}

interface LiveTimelineProps {
  articleId: string
  initialUpdates?: LiveUpdateItem[]
}

function formatLiveTime(dateString: string, lang: 'ne' | 'en') {
  const date = new Date(dateString)
  return date.toLocaleTimeString(lang === 'ne' ? 'ne-NP' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelativeLive(dateString: string, lang: 'ne' | 'en') {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

  if (diffInMinutes < 1) {
    return lang === 'ne' ? 'भर्खरै' : 'Just now'
  }
  if (diffInMinutes < 60) {
    return lang === 'ne'
      ? `${diffInMinutes} मिनेट अगाडि`
      : `${diffInMinutes}m ago`
  }
  const hours = Math.floor(diffInMinutes / 60)
  return lang === 'ne' ? `${hours} घण्टा अगाडि` : `${hours}h ago`
}

export function LiveTimeline({ articleId, initialUpdates = [] }: LiveTimelineProps) {
  const { language } = useLanguage()

  const [updates, setUpdates] = React.useState<LiveUpdateItem[]>(initialUpdates)
  const [loading, setLoading] = React.useState(false)
  const [hasNewUpdate, setHasNewUpdate] = React.useState(false)
  const [lastCheck, setLastCheck] = React.useState<Date>(new Date())

  // Poll for live updates every 20 seconds
  const fetchUpdates = React.useCallback(async (isManual = false) => {
    if (isManual) setLoading(true)
    try {
      const res = await fetch(`/api/articles/${articleId}/live`)
      if (res.ok) {
        const data = await res.json()
        const newUpdates: LiveUpdateItem[] = data.updates || []

        // If new entries were added since last check
        if (newUpdates.length > updates.length && updates.length > 0) {
          setHasNewUpdate(true)
          setTimeout(() => setHasNewUpdate(false), 5000)
        }

        setUpdates(newUpdates)
        setLastCheck(new Date())
      }
    } catch (err) {
      console.error('Error fetching live updates:', err)
    } finally {
      if (isManual) setLoading(false)
    }
  }, [articleId, updates.length])

  React.useEffect(() => {
    // Initial fetch if no initial updates
    if (initialUpdates.length === 0) {
      fetchUpdates(false)
    }

    // Set polling interval
    const interval = setInterval(() => {
      fetchUpdates(false)
    }, 20000)

    return () => clearInterval(interval)
  }, [fetchUpdates, initialUpdates.length])

  // If there are no live updates at all, don't display the live block
  if (updates.length === 0) {
    return null
  }

  return (
    <div className="my-8 rounded-3xl border-2 border-red-600 bg-red-50/20 dark:bg-red-950/10 p-5 sm:p-7 space-y-6 shadow-sm overflow-hidden relative">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none"></div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-200 dark:border-red-900/60 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-4 w-4 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
          </span>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <span>{language === 'ne' ? 'प्रत्यक्ष प्रसारण (लाइभ अपडेट)' : 'Live Coverage Timeline'}</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'ne'
                ? `घटनाक्रमका मुख्य अपडेटहरू (${updates.length} वटा घटनाक्रम संकलित)`
                : `Key developing timeline (${updates.length} updates logged)`}
            </p>
          </div>
        </div>

        {/* Live indicator & refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{language === 'ne' ? 'स्वत: ताजा अपडेट' : 'Auto-refresh active'}</span>
          </div>

          <button
            onClick={() => fetchUpdates(true)}
            disabled={loading}
            className="p-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-600 transition shadow-2xs cursor-pointer"
            title="Refresh live feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* New update banner notification */}
      {hasNewUpdate && (
        <div className="p-3 rounded-2xl bg-red-600 text-white text-xs font-bold flex items-center justify-between shadow-md animate-bounce">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{language === 'ne' ? 'नयाँ लाइभ अपडेट थपियो!' : 'New live update added!'}</span>
          </div>
          <span className="text-[10px] uppercase underline cursor-pointer">
            {language === 'ne' ? 'तल हेर्नुहोस्' : 'View below'}
          </span>
        </div>
      )}

      {/* Vertical Timeline */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-red-600/70 space-y-6">
        {updates.map((item, index) => {
          const isLatest = index === 0
          return (
            <div key={item.id} className="relative group">
              {/* Timeline marker node */}
              <span
                className={`absolute -left-[31px] sm:-left-[39px] top-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-950 transition ${
                  isLatest
                    ? 'bg-red-600 text-white ring-red-200 dark:ring-red-950 scale-110'
                    : 'bg-slate-400 dark:bg-slate-700'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
              </span>

              {/* Update Card */}
              <div
                className={`rounded-2xl p-4 sm:p-5 border shadow-2xs transition space-y-2 ${
                  isLatest
                    ? 'bg-white dark:bg-slate-900 border-red-300 dark:border-red-900/80 ring-1 ring-red-500/10'
                    : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {/* Meta header */}
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-900">
                      <Clock className="w-3 h-3" />
                      <span>{formatLiveTime(item.createdAt, language)}</span>
                    </span>

                    <span className="text-[11px] text-slate-400">
                      ({formatRelativeLive(item.createdAt, language)})
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{item.author.fullName}</span>
                  </span>
                </div>

                {/* Headline */}
                <h4 className="text-base sm:text-lg font-black text-slate-950 dark:text-white leading-snug pt-1">
                  {item.headline}
                </h4>

                {/* Content */}
                <p className="text-sm text-slate-800 dark:text-slate-200 font-serif leading-relaxed whitespace-pre-line pt-0.5">
                  {item.content}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
