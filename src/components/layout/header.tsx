'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/context/language-context'
import { TopUtilityBar } from '@/components/layout/top-utility-bar'
import { SavedArticlesModal } from '@/components/bookmarks/saved-articles-modal'
import { GlobalSearchBar } from '@/components/search/global-search-bar'
import { AdBanner } from '@/components/ads/ad-banner'
import { MobileNavDrawer } from '@/components/layout/mobile-nav-drawer'
import { Home } from 'lucide-react'

interface CategoryNav {
  id: number
  nameEn: string
  nameNe: string
  slug: string
}

export function Header({
  categories = [],
}: {
  categories?: CategoryNav[]
}) {
  const pathname = usePathname()
  const { language, t } = useLanguage()

  // Fallback categories if not passed
  const navCategories = categories.length > 0 ? categories : [
    { id: 1, nameEn: 'Politics', nameNe: 'राजनीति', slug: 'politics' },
    { id: 2, nameEn: 'Society', nameNe: 'समाज', slug: 'society' },
    { id: 3, nameEn: 'Economy', nameNe: 'अर्थ', slug: 'economy' },
    { id: 4, nameEn: 'Opinion', nameNe: 'विचार', slug: 'opinion' },
    { id: 5, nameEn: 'Sports', nameNe: 'खेलकुद', slug: 'sports' },
    { id: 6, nameEn: 'Video', nameNe: 'भिडियो', slug: 'video' },
  ]

  return (
    <header className="w-full bg-[#F0F4FA] dark:bg-[#070E20] border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* 1. Times of India Style Top Utility Bar (Live Weather, Market Rates & Circular Social Icons) */}
      <TopUtilityBar />

      {/* 2. Main Branding & Leaderboard Bar (Side-by-Side on Desktop matching thurpaonline style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-3.5 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Logo & Official Tagline + Reg. No. */}
        <div className="flex items-center justify-between w-full lg:w-auto gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-3 sm:gap-4 group shrink-0">
            <div className="relative h-14 w-52 sm:h-16 sm:w-64 bg-white rounded-lg p-1.5 shadow-2xs border border-blue-100/70 shrink-0 flex items-center">
              <Image
                src="/logo.jpg"
                alt="SabaiChha.com - सबै छ डट कम"
                width={288}
                height={64}
                className="object-contain max-h-14 sm:max-h-16 w-auto"
                priority
              />
            </div>
            <div className="hidden xl:block border-l-2 border-[#C10A1E] pl-3.5 space-y-0.5">
              <p className="text-xs font-bold text-[#02267C] dark:text-blue-300 tracking-tight">
                {language === 'ne'
                  ? 'सूचना, संवाद र मनोरञ्जनको संगम, सबै छ डट कम'
                  : 'Confluence of Information, Dialogue & Entertainment'}
              </p>
              <div className="flex items-center gap-2 text-[10.5px]">
                <span className="font-semibold text-[#C10A1E] dark:text-red-400 font-mono">
                  https://sabaichha.com
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {language === 'ne' ? 'सूचना विभाग दर्ता नं. ५३२७' : 'Regd. No. 5327'}
                </span>
              </div>
            </div>
          </Link>

          {/* Mobile Search & Saved Articles (Clean circular icon buttons) */}
          <div className="flex lg:hidden items-center gap-2">
            <GlobalSearchBar variant="icon" />
            <SavedArticlesModal variant="icon" />
          </div>
        </div>

        {/* Right: Scaled Header Leaderboard Ad Banner + Well-Spaced Search & Saved Icons */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4 justify-end shrink-0">
          <div className="w-[460px] xl:w-[520px] 2xl:w-[560px] max-w-full">
            <AdBanner placement="HEADER_LEADERBOARD" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <GlobalSearchBar variant="icon" />
            <SavedArticlesModal variant="icon" />
          </div>
        </div>
      </div>

      {/* Mobile-only Header Leaderboard Ad (auto-hidden if no active ad in database) */}
      <AdBanner
        placement="HEADER_LEADERBOARD"
        className="max-w-7xl mx-auto px-2.5 sm:px-4 pb-2.5 lg:hidden"
      />

      {/* 4. Official Royal Navy & Crimson Navigation Bar */}
      <nav className="bg-[#02267C] dark:bg-[#031B56] border-t-2 border-[#C10A1E] shadow-md overflow-x-auto scrollbar-none touch-pan-x">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 flex items-center gap-1 min-w-max sm:min-w-0">
          
          {/* Mobile All Categories / Full Directory Hamburger Drawer */}
          <MobileNavDrawer categories={navCategories} />

          {/* Vertical Divider */}
          <span className="h-4 w-px bg-white/20 shrink-0 mx-0.5" />

          {/* Home Icon */}
          <Link
            href="/"
            title={t('home') || (language === 'ne' ? 'गृहपृष्ठ' : 'Home')}
            aria-label={t('home') || (language === 'ne' ? 'गृहपृष्ठ' : 'Home')}
            className={`shrink-0 px-3.5 py-2.5 text-sm font-bold whitespace-nowrap transition flex items-center justify-center ${
              pathname === '/'
                ? 'bg-[#C10A1E] text-white shadow-xs'
                : 'text-white/90 hover:bg-[#011C5E] hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
          </Link>

          {navCategories.map((cat) => {
            const isCatActive =
              pathname === `/category/${cat.slug}` ||
              pathname.startsWith(`/category/${cat.slug}/`)

            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`shrink-0 px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                  isCatActive
                    ? 'bg-[#C10A1E] text-white shadow-xs'
                    : 'text-white/95 hover:bg-[#011C5E] hover:text-white'
                }`}
              >
                {language === 'ne' ? cat.nameNe : cat.nameEn}
              </Link>
            )
          })}

          {/* Daily Rashifal */}
          {(() => {
            const isRashifalActive =
              pathname === '/rashifal' || pathname === '/tools/rashifal'
            return (
              <Link
                href="/rashifal"
                className={`shrink-0 px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                  isRashifalActive
                    ? 'bg-[#C10A1E] text-white shadow-xs'
                    : 'text-amber-300 hover:bg-[#011C5E] hover:text-amber-200 font-bold'
                }`}
              >
                {language === 'ne' ? 'राशिफल' : 'Horoscope'}
              </Link>
            )
          })()}

          {/* Utility Tools Directory */}
          {(() => {
            const isToolsActive =
              pathname === '/tools' ||
              (pathname.startsWith('/tools') && pathname !== '/tools/rashifal')
            return (
              <Link
                href="/tools"
                className={`shrink-0 px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                  isToolsActive
                    ? 'bg-[#C10A1E] text-white shadow-xs'
                    : 'text-emerald-300 hover:bg-[#011C5E] hover:text-emerald-200 font-bold'
                }`}
              >
                {language === 'ne' ? 'उपयोगी टुल्स' : 'Tools'}
              </Link>
            )
          })()}
        </div>
      </nav>
    </header>
  )
}
