'use client'

import * as React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/language-context'
import { Flame, ChevronRight, Zap } from 'lucide-react'

interface BreakingStory {
  id: string
  title: string
  slug: string
}

export function BreakingTicker({
  breakingArticles,
}: {
  breakingArticles: BreakingStory[]
}) {
  const { language } = useLanguage()
  const [currentIndex, setCurrentIndex] = React.useState(0)

  // Rotate breaking articles every 5 seconds if multiple exist
  React.useEffect(() => {
    if (breakingArticles.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingArticles.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [breakingArticles.length])

  if (!breakingArticles || breakingArticles.length === 0) {
    return null
  }

  const currentStory = breakingArticles[currentIndex]

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-y border-red-100 dark:border-red-950/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2 flex items-center gap-3 overflow-hidden">
        {/* Red High-Impact Badge */}
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black tracking-wider uppercase shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <Flame className="w-3.5 h-3.5" />
          <span>{language === 'ne' ? 'ताजा अपडेट' : 'BREAKING'}</span>
        </div>

        {/* Story Headline */}
        <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
          <Link
            href={`/news/${currentStory.slug}`}
            className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition truncate flex items-center gap-2 group"
          >
            <span className="group-hover:translate-x-0.5 transition-transform">
              {currentStory.title}
            </span>
          </Link>

          {/* Dots Indicator if multiple */}
          {breakingArticles.length > 1 && (
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              {breakingArticles.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentIndex
                      ? 'w-4 bg-red-600'
                      : 'w-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
                  }`}
                  aria-label={`Go to breaking story ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
