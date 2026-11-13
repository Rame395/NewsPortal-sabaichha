'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/context/language-context'
import { TopUtilityBar } from '@/components/layout/top-utility-bar'
import { AdBanner } from '@/components/ads/ad-banner'
import { MobileNavDrawer } from '@/components/layout/mobile-nav-drawer'
import { Home, ChevronDown, MapPin } from 'lucide-react'
import { PROVINCES } from '@/lib/constants/provinces'

interface CategoryNav {
  id: number
  nameEn: string
  nameNe: string
  slug: string
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

export function Header({
  categories = [],
}: {
  categories?: CategoryNav[]
}) {
  const pathname = usePathname()
  const { language, t } = useLanguage()

  const [isProvinceOpen, setIsProvinceOpen] = React.useState(false)
  const [dropdownCoords, setDropdownCoords] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  })

  const navScrollRef = React.useRef<HTMLDivElement>(null)
  const provinceWrapperRef = React.useRef<HTMLDivElement>(null)
  const provinceBtnRef = React.useRef<HTMLButtonElement>(null)
  const provinceMenuRef = React.useRef<HTMLDivElement>(null)
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Detect active province if user is on /province/[slug]
  const activeProvince = React.useMemo(() => {
    if (!pathname?.startsWith('/province/')) return null
    const slug = pathname.split('/province/')[1]?.split('/')[0]
    return PROVINCES.find((p) => p.slug === slug) || null
  }, [pathname])

  const updateDropdownPosition = React.useCallback(() => {
    if (!provinceBtnRef.current || typeof window === 'undefined') return
    const rect = provinceBtnRef.current.getBoundingClientRect()
    const menuWidth = 230
    const maxLeft = Math.max(8, window.innerWidth - menuWidth - 8)
    setDropdownCoords({
      top: rect.bottom + 2,
      left: Math.min(Math.max(8, rect.left), maxLeft),
    })
  }, [])

  const openProvinceDropdown = React.useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    updateDropdownPosition()
    setIsProvinceOpen(true)
  }, [updateDropdownPosition])

  const scheduleCloseProvinceDropdown = React.useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    closeTimeoutRef.current = setTimeout(() => {
      setIsProvinceOpen(false)
    }, 150)
  }, [])

  // Auto-close dropdown when route changes
  React.useEffect(() => {
    setIsProvinceOpen(false)
  }, [pathname])

  // Keep dropdown anchored to button on scroll or resize
  React.useEffect(() => {
    if (!isProvinceOpen) return
    updateDropdownPosition()
    const handleUpdate = () => updateDropdownPosition()
    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)
    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [isProvinceOpen, updateDropdownPosition])

  // Click outside listener
  React.useEffect(() => {
    if (!isProvinceOpen) return
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (
        provinceWrapperRef.current &&
        !provinceWrapperRef.current.contains(target) &&
        provinceMenuRef.current &&
        !provinceMenuRef.current.contains(target)
      ) {
        setIsProvinceOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isProvinceOpen])

  // Preserve horizontal scroll position of the navbar across route navigations
  // so the navbar stays exactly where the user clicked
  useIsomorphicLayoutEffect(() => {
    const container = navScrollRef.current
    if (!container || typeof window === 'undefined') return

    try {
      const savedScroll = sessionStorage.getItem('sabaichha_nav_scroll')
      if (savedScroll !== null) {
        container.scrollLeft = Number(savedScroll)
      }
    } catch {}

    // Ensure the active link is comfortably visible inside the horizontal bar
    const activeEl = container.querySelector<HTMLElement>('[data-nav-active="true"]')
    if (activeEl) {
      const cRect = container.getBoundingClientRect()
      const aRect = activeEl.getBoundingClientRect()
      if (aRect.left < cRect.left + 12) {
        container.scrollLeft -= cRect.left + 16 - aRect.left
      } else if (aRect.right > cRect.right - 12) {
        container.scrollLeft += aRect.right - (cRect.right - 16)
      }
    }
  }, [pathname])

  const handleNavScroll = () => {
    if (!navScrollRef.current) return
    try {
      sessionStorage.setItem('sabaichha_nav_scroll', String(navScrollRef.current.scrollLeft))
    } catch {}
  }

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
    <header className="w-full bg-white dark:bg-[#070E20] border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* 1. Times of India Style Top Utility Bar (Live Weather, Market Rates & Circular Social Icons) */}
      <TopUtilityBar />

      {/* 2. Main Branding & Leaderboard Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-1.5 sm:py-3.5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 lg:gap-4">
        {/* Left: Logo & Official Tagline (Left-aligned on Mobile and Desktop) */}
        <div className="flex items-center justify-start w-full lg:w-auto gap-4 shrink-0">
          <Link href="/" prefetch={true} className="flex items-center justify-start gap-3 sm:gap-4 group shrink-0">
            <div className="relative h-14 sm:h-20 md:h-22 shrink-0 flex items-center justify-start bg-white rounded-xl px-1.5 sm:px-2 py-1">
              <Image
                src="/logo-v2.jpg"
                alt="SabaiChha.com - सबै छ डट कम"
                width={320}
                height={134}
                className="object-contain h-12 sm:h-18 md:h-20 w-auto"
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
                  {language === 'ne' ? 'सूचना संवाद र मनोरञ्जनको संगम' : 'Information & Entertainment'}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Right: Scaled Header Leaderboard Ad Banner */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4 justify-end shrink-0">
          <div className="w-[460px] xl:w-[520px] 2xl:w-[560px] max-w-full">
            <AdBanner placement="HEADER_LEADERBOARD" />
          </div>
        </div>
      </div>

      {/* 3. Official Royal Navy & Crimson Navigation Bar */}
      <nav
        ref={navScrollRef}
        onScroll={handleNavScroll}
        className="bg-[#02267C] dark:bg-[#031B56] border-t-2 border-[#C10A1E] shadow-md overflow-x-auto scrollbar-none touch-pan-x"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-8 flex items-center gap-1 min-w-max sm:min-w-0 relative">
          {/* Mobile All Categories / Full Directory Hamburger Drawer */}
          <MobileNavDrawer categories={navCategories} />

          {/* Vertical Divider */}
          <span className="h-4 w-px bg-white/20 shrink-0 mx-0.5" />

          {/* Home Icon */}
          <Link
            href="/"
            prefetch={true}
            data-nav-active={pathname === '/' ? 'true' : undefined}
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
                prefetch={true}
                data-nav-active={isFirstActive ? 'true' : undefined}
                onClick={handleNavScroll}
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
            ref={provinceWrapperRef}
            className="relative shrink-0"
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse') openProvinceDropdown()
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === 'mouse') scheduleCloseProvinceDropdown()
            }}
          >
            <button
              ref={provinceBtnRef}
              type="button"
              data-nav-active={pathname.startsWith('/province') ? 'true' : undefined}
              onClick={() => {
                handleNavScroll()
                if (isProvinceOpen) {
                  setIsProvinceOpen(false)
                } else {
                  openProvinceDropdown()
                }
              }}
              className={`shrink-0 px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                pathname.startsWith('/province') || isProvinceOpen
                  ? 'bg-[#C10A1E] text-white shadow-xs'
                  : 'text-white/95 hover:bg-[#011C5E] hover:text-white'
              }`}
              aria-expanded={isProvinceOpen}
              aria-haspopup="true"
            >
              <span>
                {activeProvince
                  ? language === 'ne'
                    ? `${activeProvince.nameNe}`
                    : `${activeProvince.nameEn}`
                  : language === 'ne'
                  ? 'प्रदेश'
                  : 'Province'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isProvinceOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
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
                prefetch={true}
                data-nav-active={isCatActive ? 'true' : undefined}
                onClick={handleNavScroll}
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
                prefetch={true}
                data-nav-active={isRashifalActive ? 'true' : undefined}
                onClick={handleNavScroll}
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
                prefetch={true}
                data-nav-active={isToolsActive ? 'true' : undefined}
                onClick={handleNavScroll}
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

          {/* Our Team Page Link */}
          {(() => {
            const isTeamActive = pathname === '/our-team' || pathname === '/team'
            return (
              <Link
                href="/our-team"
                prefetch={true}
                data-nav-active={isTeamActive ? 'true' : undefined}
                onClick={handleNavScroll}
                className={`shrink-0 px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                  isTeamActive
                    ? 'bg-[#C10A1E] text-white shadow-xs'
                    : 'text-amber-200 hover:bg-[#011C5E] hover:text-white font-bold'
                }`}
              >
                {language === 'ne' ? 'हाम्रो टिम' : 'Our Team'}
              </Link>
            )
          })()}
        </div>
      </nav>

      {/* Fixed-Position Province Dropdown Portal (Never clipped by horizontal overflow) */}
      {isProvinceOpen && (
        <div
          ref={provinceMenuRef}
          style={{
            position: 'fixed',
            top: `${dropdownCoords.top}px`,
            left: `${dropdownCoords.left}px`,
          }}
          onPointerEnter={(e) => {
            if (e.pointerType === 'mouse') openProvinceDropdown()
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === 'mouse') scheduleCloseProvinceDropdown()
          }}
          className="z-[100] w-[230px] animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="bg-[#02267C] dark:bg-[#031B56] border-2 border-[#C10A1E] rounded-xl shadow-2xl py-1.5 overflow-hidden">
            <div className="px-3.5 py-1.5 border-b border-white/15 text-[10.5px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-amber-300" />
              <span>{language === 'ne' ? '७ वटै प्रदेश समाचार' : 'All 7 Provinces'}</span>
            </div>
            {PROVINCES.map((prov) => {
              const isProvActive = pathname === `/province/${prov.slug}`
              return (
                <Link
                  key={prov.slug}
                  href={`/province/${prov.slug}`}
                  prefetch={true}
                  onClick={() => {
                    handleNavScroll()
                    setIsProvinceOpen(false)
                  }}
                  className={`px-3.5 py-2.5 text-xs font-bold transition flex items-center justify-between ${
                    isProvActive
                      ? 'bg-[#C10A1E] text-white'
                      : 'text-white/95 hover:bg-[#011C5E] hover:text-white'
                  }`}
                >
                  <span>{language === 'ne' ? prov.nameNe : prov.nameEn}</span>
                  <span className="text-[10px] text-white/60 font-normal">
                    {language === 'ne' ? prov.nameEn : prov.nameNe}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Mobile-only Header Leaderboard Ad */}
      <AdBanner
        placement="HEADER_LEADERBOARD"
        className="max-w-7xl mx-auto px-2.5 sm:px-4 py-2 lg:hidden"
      />
    </header>
  )
}
