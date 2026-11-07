'use client'

import * as React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/language-context'
import { Flame, Sparkles } from 'lucide-react'
import { TrendingTopicsSettings } from '@/lib/settings'

export function TrendingRibbon({
  trendingTopics,
}: {
  trendingTopics?: TrendingTopicsSettings
}) {
  const { language } = useLanguage()

  if (!trendingTopics || !trendingTopics.enabled) {
    return null
  }

  const activeItems = (trendingTopics.items || []).filter((item) => item.isActive)

  if (activeItems.length === 0) {
    return null
  }

  const title =
    language === 'ne'
      ? trendingTopics.titleNe || 'चर्चामा'
      : trendingTopics.titleEn || 'Trending'

  return (
    <div
      aria-label="Trending Topics"
      className="marquee-container relative w-full bg-slate-100 dark:bg-[#0D1527] border-b border-slate-200 dark:border-slate-800 text-xs py-1 sm:py-1.5 px-2 sm:px-4 overflow-hidden flex items-center select-none shadow-2xs transition-colors"
    >
      <div className="max-w-7xl mx-auto w-full flex items-center relative overflow-hidden">
        
        {/* Pinned Left Badge */}
        <div className="relative z-20 shrink-0 flex items-center gap-1 sm:gap-1.5 pr-2 sm:pr-3 bg-slate-100 dark:bg-[#0D1527] border-r border-slate-300 dark:border-slate-800">
          <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400">
            <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-red-600 dark:fill-red-400 animate-pulse" />
          </span>
          <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[10px] sm:text-[11px] whitespace-nowrap">
            {title}:
          </span>
        </div>

        {/* Seamless 60 FPS Infinite Marquee Track (Dual Track) */}
        <div className="flex-1 overflow-hidden relative flex items-center">
          
          {/* Soft Fade Mask on Left edge (inside track, never slices text) */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 sm:w-6 z-10 bg-gradient-to-r from-slate-100 dark:from-[#0D1527] to-transparent" />

          {/* Soft Fade Mask on Right edge (inside track) */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-8 z-10 bg-gradient-to-l from-slate-100 dark:from-[#0D1527] to-transparent" />

          {/* Track 1 */}
          <div className="animate-marquee-infinite flex items-center gap-1.5 sm:gap-2.5 shrink-0 py-0.5 pl-2 pr-2">
            {activeItems.map((item, index) => {
              const label = language === 'ne' ? item.labelNe : item.labelEn || item.labelNe
              const cleanQuery = item.labelNe.replace(/^#/, '').trim()
              const targetUrl = item.url || `/search?q=${encodeURIComponent(cleanQuery)}`

              return (
                <Link
                  key={`t1-${item.id}-${index}`}
                  href={targetUrl}
                  className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:border-red-600 dark:hover:border-red-600 shadow-2xs hover:shadow-xs transition duration-200 whitespace-nowrap group/pill"
                  title={`Explore topic: ${label}`}
                >
                  {item.isHot && (
                    <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500 animate-pulse group-hover/pill:text-white group-hover/pill:fill-white" />
                  )}
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>

          {/* Track 2 (Exact Duplicate for Gapless Infinite Marquee Loop) */}
          <div
            className="animate-marquee-infinite flex items-center gap-1.5 sm:gap-2.5 shrink-0 py-0.5 pl-2 pr-2"
            aria-hidden="true"
          >
            {activeItems.map((item, index) => {
              const label = language === 'ne' ? item.labelNe : item.labelEn || item.labelNe
              const cleanQuery = item.labelNe.replace(/^#/, '').trim()
              const targetUrl = item.url || `/search?q=${encodeURIComponent(cleanQuery)}`

              return (
                <Link
                  key={`t2-${item.id}-${index}`}
                  href={targetUrl}
                  tabIndex={-1}
                  className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:border-red-600 dark:hover:border-red-600 shadow-2xs hover:shadow-xs transition duration-200 whitespace-nowrap group/pill"
                  title={`Explore topic: ${label}`}
                >
                  {item.isHot && (
                    <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500 animate-pulse group-hover/pill:text-white group-hover/pill:fill-white" />
                  )}
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>

        </div>

      </div>
    </div>
  )
}
