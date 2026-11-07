'use client'

import * as React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/language-context'
import { getLocalizedTitle } from '@/lib/data/translations'
import { Zap, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { toNepaliNumerals } from '@/lib/market/market-service'

interface BreakingStory {
  id: string
  title: string
  slug: string
  publishedAt?: Date | string | null
  category?: { nameEn: string; nameNe: string }
}

export function BreakingTicker({
  breakingArticles,
}: {
  breakingArticles: BreakingStory[]
}) {
  const { language } = useLanguage()
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)

  // Rotate breaking articles every 5.5 seconds if multiple exist and not hovered
  React.useEffect(() => {
    if (breakingArticles.length <= 1 || isPaused) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingArticles.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [breakingArticles.length, isPaused])

  if (!breakingArticles || breakingArticles.length === 0) {
    return null
  }

  const currentStory = breakingArticles[currentIndex]

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentIndex((prev) => (prev - 1 + breakingArticles.length) % breakingArticles.length)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentIndex((prev) => (prev + 1) % breakingArticles.length)
  }

  // Format relative time helper
  const getRelativeTime = (dateStr?: Date | string | null) => {
    if (!dateStr) return ''
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    if (diff < 60) {
      return language === 'ne' ? `${toNepaliNumerals(diff)} मिनेट अगाडि` : `${diff}m ago`
    }
    const hours = Math.floor(diff / 60)
    if (hours < 24) {
      return language === 'ne' ? `${toNepaliNumerals(hours)} घण्टा अगाडि` : `${hours}h ago`
    }
    const days = Math.floor(hours / 24)
    return language === 'ne' ? `${toNepaliNumerals(days)} दिन अगाडि` : `${days}d ago`
  }

  const categoryName = currentStory.category
    ? language === 'ne'
      ? currentStory.category.nameNe
      : currentStory.category.nameEn
    : null

  const counterText =
    language === 'ne'
      ? `${toNepaliNumerals(currentIndex + 1)} / ${toNepaliNumerals(breakingArticles.length)}`
      : `${currentIndex + 1} / ${breakingArticles.length}`

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 dark:from-[#881337] dark:via-[#991b1b] dark:to-[#450a0a] text-white border-y border-red-700/60 dark:border-red-700/50 shadow-md shadow-red-600/20 z-10 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-1.5 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
        
        {/* LEFT: Broadcast "BREAKING NEWS" Badge (High-Contrast Jet Black on Red Bar) */}
        <div className="shrink-0 flex items-center gap-1.5 sm:gap-2 bg-slate-950 text-white dark:bg-black/85 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-lg border border-red-400/30 dark:border-red-500/30 shadow-md">
          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-90"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-yellow-400"></span>
          </span>
          <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 animate-pulse hidden sm:block" />
          <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase text-yellow-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] whitespace-nowrap">
            <span className="sm:hidden">{language === 'ne' ? 'ताजा खबर' : 'BREAKING'}</span>
            <span className="hidden sm:inline">{language === 'ne' ? 'ताजा खबर' : 'BREAKING NEWS'}</span>
          </span>
        </div>

        {/* CENTER: Story Headline with Category & Freshness */}
        <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-2.5">
          {categoryName && (
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md bg-white/20 dark:bg-white/10 text-white text-[10.5px] font-black tracking-wide border border-white/30 shrink-0 uppercase shadow-2xs backdrop-blur-xs">
              {categoryName}
            </span>
          )}

          <Link
            href={`/news/${currentStory.slug}`}
            key={currentStory.id}
            className="text-xs sm:text-[14px] md:text-[15px] font-extrabold text-white hover:text-yellow-200 transition truncate flex-1 block leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] group animate-in fade-in duration-300"
            title={currentStory.title}
          >
            <span className="group-hover:underline underline-offset-2">
              {getLocalizedTitle(currentStory, language)}
            </span>
          </Link>

          {currentStory.publishedAt && (
            <span className="hidden lg:inline text-[11px] font-semibold text-red-100/90 shrink-0 pl-1">
              • {getRelativeTime(currentStory.publishedAt)}
            </span>
          )}
        </div>

        {/* RIGHT: Story Counter, Prev/Next Arrows, & "Full Story" CTA */}
        <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
          {/* Read Full Story Button */}
          <Link
            href={`/news/${currentStory.slug}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white text-red-700 hover:bg-yellow-300 hover:text-slate-950 text-[11px] font-black transition-all shadow-sm hover:shadow-md whitespace-nowrap transform hover:scale-105 active:scale-95"
          >
            <span>{language === 'ne' ? 'पूरा विवरण' : 'Full Story'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Carousel Arrows if multiple breaking items exist */}
          {breakingArticles.length > 1 && (
            <div className="flex items-center gap-1 pl-1 sm:pl-1.5 border-l border-white/25">
              <span className="hidden sm:inline text-[10.5px] font-mono font-bold text-white/90 pr-1">
                {counterText}
              </span>
              <button
                type="button"
                onClick={handlePrev}
                className="p-0.5 sm:p-1 rounded-md bg-black/35 hover:bg-black/60 active:bg-black/80 text-white transition cursor-pointer border border-white/10"
                title="अघिल्लो समाचार (Previous)"
                aria-label="Previous breaking story"
              >
                <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-0.5 sm:p-1 rounded-md bg-black/35 hover:bg-black/60 active:bg-black/80 text-white transition cursor-pointer border border-white/10"
                title="अर्को समाचार (Next)"
                aria-label="Next breaking story"
              >
                <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Dynamic Rotation Progress Indicator */}
      {breakingArticles.length > 1 && (
        <div
          className="absolute bottom-0 left-0 h-[2.5px] bg-yellow-400 dark:bg-yellow-400 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(250,204,21,0.9)]"
          style={{
            width: `${((currentIndex + 1) / breakingArticles.length) * 100}%`,
          }}
        />
      )}
    </div>
  )
}
