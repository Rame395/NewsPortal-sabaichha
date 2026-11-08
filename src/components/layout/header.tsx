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
import { Home, ChevronDown } from 'lucide-react'
import { PROVINCES } from '@/lib/constants/provinces'

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

  const [isProvinceOpen, setIsProvinceOpen] = React.useState(false)
  const provinceDropdownRef = React.useRef<HTMLDivElement>(null)

  // Auto-close dropdown when route changes
  React.useEffect(() => {
    setIsProvinceOpen(false)
  }, [pathname])

  // Click outside listener
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (provinceDropdownRef.current && !provinceDropdownRef.current.contains(e.target as Node)) {
        setIsProvinceOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
            <div className="relative h-14 w-52 sm:h-18 sm:w-72 bg-white rounded-lg p-1.5 shadow-2xs border border-blue-100/70 shrink-0 flex items-center justify-center">
              <Image
                src="/logo.jpg"
                alt="SabaiChha.com - सबै छ डट कम"
                width={300}
                height={75}
                className="object-contain max-h-13 sm:max-h-16 w-auto"
                priority
              />
            </div>
            <div className="hidden xl:block border-l-2 border-[#C10A1E] pl-3.5 space-y-0.5">
              <p className="text-xs font-bold text-[#02267C] dark:text-blue-300 tracking-tight">
                {language === 'ne'
                  ? 'नेपालको आधिकारिक डिजिटल अनलाइन पत्रिका'
                  : 'Nepal’s Official Digital News Portal'}
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
      <nav className="bg-[#02267C] dark:bg-[#031B56] border-t-2 border-[#C10A1E] shadow-md overflow-x-auto md:overflow-visible scrollbar-none touch-pan-x">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 flex items-center gap-1 min-w-max sm:min-w-0 relative">
          
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

          {/* First Category (e.g. राजनीति / Politics) */}
          {navCategories.length > 0 && (() => {
            const firstCat = navCategories[0]
            const isFirstActive =
              pathname === `/category/${firstCat.slug}` ||
              pathname.startsWith(`/category/${firstCat.slug}/`)
            return (
              <Link
                key={firstCat.id}
                href={`/category/${firstCat.slug}`}
                className={`shrink-0 px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                  isFirstActive
                    ? 'bg-[#C10A1E] text-white shadow-xs'
                    : 'text-white/95 hover:bg-[#011C5E] hover:text-white'
                }`}
              >
                {language === 'ne' ? firstCat.nameNe : firstCat.nameEn}
              </Link>
            )
          })()}

          {/* Province News Dropdown (प्रदेश समाचार - ७ प्रदेश) */}
          <div
            ref={provinceDropdownRef}
            className="relative group shrink-0"
            onMouseEnter={() => setIsProvinceOpen(true)}
            onMouseLeave={() => setIsProvinceOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsProvinceOpen((prev) => !prev)}
              className={`shrink-0 px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                pathname.startsWith('/province')
                  ? 'bg-[#C10A1E] text-white shadow-xs'
                  : 'text-white/95 hover:bg-[#011C5E] hover:text-white'
              }`}
              aria-expanded={isProvinceOpen}
              aria-haspopup="true"
            >
              <span>{language === 'ne' ? 'प्रदेश' : 'Province'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isProvinceOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Popup */}
            <div
              className={`absolute left-0 top-full pt-1 z-50 min-w-[210px] transition-all duration-150 ${
                isProvinceOpen
                  ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                  : 'opacity-0 invisible -translate-y-1 pointer-events-none'
              }`}
            >
              <div className="bg-[#02267C] dark:bg-[#031B56] border-2 border-[#C10A1E] rounded-b-xl shadow-2xl py-1 overflow-hidden">
                <div className="px-3.5 py-1.5 border-b border-white/10 text-[10.5px] font-extrabold uppercase tracking-wider text-white/70">
                  {language === 'ne' ? '७ वटै प्रदेश समाचार' : 'All 7 Provinces'}
                </div>
                {PROVINCES.map((prov) => {
                  const isProvActive = pathname === `/province/${prov.slug}`
                  return (
                    <Link
                      key={prov.slug}
                      href={`/province/${prov.slug}`}
                      onClick={() => setIsProvinceOpen(false)}
                      className={`px-3.5 py-2 text-xs font-bold transition flex items-center justify-between ${
                        isProvActive
                          ? 'bg-[#C10A1E] text-white'
                          : 'text-white/90 hover:bg-[#011C5E] hover:text-white'
                      }`}
                    >
                      <span>{language === 'ne' ? prov.nameNe : prov.nameEn}</span>
                      <span className="text-[10px] text-white/50 font-normal">
                        {language === 'ne' ? prov.nameEn : prov.nameNe}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Remaining Categories */}
          {navCategories.slice(1).map((cat) => {
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
