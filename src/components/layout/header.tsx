'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/context/language-context'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { Calendar, Search, Shield } from 'lucide-react'

export function Header() {
  const { language, t } = useLanguage()

  const [formattedDate, setFormattedDate] = React.useState<string>('')

  React.useEffect(() => {
    const today = new Date()
    setFormattedDate(
      today.toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    )
  }, [language])

  return (
    <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
      {/* Top Utility Bar */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span>{formattedDate || '—'}</span>
            </div>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
            <div className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span>{language === 'ne' ? 'काठमाडौं, नेपाल' : 'Kathmandu, Nepal'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
              title={language === 'ne' ? 'कर्मचारी लगइन' : 'Staff Sign In'}
            >
              <Shield className="w-3.5 h-3.5 text-red-500" />
              <span>{t('login')}</span>
            </Link>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Branding Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative h-14 w-60 sm:h-16 sm:w-72 bg-white rounded-lg p-1 shadow-sm">
            <Image
              src="/logo.jpg"
              alt="SabaiChha.com - सबै छ डट कम"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden lg:block border-l border-slate-200 dark:border-slate-800 pl-4">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {language === 'ne'
                ? '“सूचना संवाद र मनोरञ्जनको संगम, सबै छ डट कम”'
                : '“The confluence of information, dialogue, and entertainment”'}
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              https://sabaichha.com
            </p>
          </div>
        </Link>

        {/* Quick Search Bar preview */}
        <div className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Primary Category Navigation Bar */}
      <nav className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="px-3 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400 whitespace-nowrap"
          >
            {t('home')}
          </Link>
          <Link
            href="/category/politics"
            className="px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition whitespace-nowrap"
          >
            {t('politics')}
          </Link>
          <Link
            href="/category/society"
            className="px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition whitespace-nowrap"
          >
            {t('society')}
          </Link>
          <Link
            href="/category/economy"
            className="px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition whitespace-nowrap"
          >
            {t('economy')}
          </Link>
          <Link
            href="/category/opinion"
            className="px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition whitespace-nowrap"
          >
            {t('opinion')}
          </Link>
          <Link
            href="/category/sports"
            className="px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition whitespace-nowrap"
          >
            {t('sports')}
          </Link>
          <Link
            href="/category/video"
            className="px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition whitespace-nowrap"
          >
            {t('video')}
          </Link>
        </div>
      </nav>
    </header>
  )
}
