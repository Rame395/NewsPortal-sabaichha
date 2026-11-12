'use client'

import * as React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/language-context'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { formatBikramSambat, formatNepaliTime } from '@/lib/date/nepali-calendar'
import {
  FacebookIcon,
  YoutubeIcon,
  InstagramIcon,
  TikTokIcon,
} from '@/components/ui/social-icons'
import {
  Calendar,
  Clock,
  Coins,
  TrendingUp,
  TrendingDown,
  Sun,
  DollarSign,
} from 'lucide-react'

interface MarketWeatherData {
  weather: {
    cityNe: string
    cityEn: string
    temp: string
    tempNe?: string
    conditionNe: string
    conditionEn: string
    icon: string
    enabled: boolean
  }
  market: {
    gold: string
    goldEn?: string
    silver: string
    silverEn?: string
    showGold: boolean
    nepse: string
    nepseEn?: string
    nepseChange: string
    nepseChangeEn?: string
    nepsePct?: string
    nepsePctEn?: string
    nepsePositive: boolean
    showNepse: boolean
    usd: string
    usdEn?: string
    showForex: boolean
  }
  social: {
    facebook?: string
    twitter?: string
    youtube?: string
    instagram?: string
    linkedin?: string
    telegram?: string
    whatsapp?: string
    tiktok?: string
  }
}

export function TopUtilityBar() {
  const { language, t } = useLanguage()

  // Real-time date & live ticking clock
  const [dateInfo, setDateInfo] = React.useState(() => formatBikramSambat(new Date()))
  const [liveTime, setLiveTime] = React.useState<string>(() => {
    const tm = formatNepaliTime(new Date())
    return tm.nepali
  })
  const [data, setData] = React.useState<MarketWeatherData | null>(null)

  // Real-time ticking 24h clock every second
  React.useEffect(() => {
    const tick = () => {
      const now = new Date()
      const bs = formatBikramSambat(now)
      const tm = formatNepaliTime(now)
      setDateInfo(bs)
      setLiveTime(language === 'ne' ? tm.nepali : tm.english)
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [language])

  // Fetch real-time weather and market tickers (smart polling every 60s, pauses on hidden tabs)
  React.useEffect(() => {
    let isMounted = true
    let lastFetched = 0

    const loadMarketWeather = () => {
      // Don't poll if browser tab is in background
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return
      }

      fetch(`/api/public/market-weather?t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((resData) => {
          if (isMounted && resData && !resData.error) {
            setData(resData)
            lastFetched = Date.now()
          }
        })
        .catch((err) => console.error('Failed to load market-weather:', err))
    }

    loadMarketWeather()
    const interval = setInterval(loadMarketWeather, 60 * 1000)

    // When user returns to tab, refresh if more than 60s have passed
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastFetched > 60 * 1000) {
        loadMarketWeather()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const socialLinks = {
    facebook: data?.social?.facebook || 'https://facebook.com/sabaichha',
    youtube: data?.social?.youtube || 'https://youtube.com/@sabaichha',
    instagram: data?.social?.instagram || 'https://instagram.com/@sabaichha',
    tiktok: data?.social?.tiktok || 'https://tiktok.com/@sabaichha',
  }

  const weather = data?.weather || {
    cityNe: 'काठमाडौँ',
    cityEn: 'Kathmandu',
    temp: '17°C',
    tempNe: '१७°C',
    conditionNe: 'सफा आकाश',
    conditionEn: 'Clear sky',
    icon: 'sun',
    enabled: true,
  }

  const market = data?.market || {
    gold: '२,७४,३००',
    goldEn: '2,74,300',
    silver: '३,७२०',
    silverEn: '3,720',
    showGold: true,
    nepse: '२,६५७.५०',
    nepseEn: '2,657.50',
    nepseChange: '-३२.६५ (-१.२१%)',
    nepseChangeEn: '-32.65 (-1.21%)',
    nepsePct: '(-१.२१%)',
    nepsePctEn: '(-1.21%)',
    nepsePositive: false,
    showNepse: true,
    usd: '१५२.०३',
    usdEn: '152.03',
    showForex: true,
  }

  const goldDisplay = language === 'ne' ? `रु ${market.gold}` : `Rs ${market.goldEn || market.gold}`
  const nepseDisplay = language === 'ne' ? market.nepse : market.nepseEn || market.nepse
  const nepseChangeDisplay =
    language === 'ne' ? market.nepseChange : market.nepseChangeEn || market.nepseChange
  const nepsePctDisplay =
    language === 'ne'
      ? market.nepsePct || '(-१.२१%)'
      : market.nepsePctEn || '(-1.21%)'
  const usdDisplay = language === 'ne' ? `रु ${market.usd}` : `Rs ${market.usdEn || market.usd}`

  return (
    <div
      translate="no"
      className="notranslate relative z-30 w-full bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 border-b border-slate-200/90 dark:border-slate-800 text-[11px] h-8 sm:h-9.5 px-2.5 sm:px-8 transition-colors select-none flex items-center"
    >
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-2 min-w-0">
        
        {/* ======================================================== */}
        {/* 1. LEFT ZONE: Edition, Language Dropdown & Live Clock (shrink-0) */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Edition Pill */}
          <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 shrink-0">
            <span className="hidden 2xl:inline text-[10px]">{language === 'ne' ? 'संस्करण' : 'Edition'}</span>
            <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 shadow-2xs font-semibold">
              <span>🇳🇵 NP</span>
            </span>
          </div>

          {/* Divider */}
          <span className="h-3 w-px bg-slate-300 dark:bg-slate-700 shrink-0" />

          {/* Language Toggle with Floating Dropdown */}
          <div className="shrink-0">
            <LanguageToggle />
          </div>

          {/* Divider */}
          <span className="h-3 w-px bg-slate-300 dark:bg-slate-700 shrink-0" />

          {/* Real-Time Live Clock & Date Converter Link */}
          <Link
            href="/tools/date-converter"
            className="flex items-center gap-1 sm:gap-1.5 text-slate-700 dark:text-slate-300 shrink-0 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer group/date"
            title={
              language === 'ne'
                ? 'नेपाली मिति रूपान्तरक (B.S. ⇄ A.D.) हेर्नुहोस्'
                : 'Open Nepali Date Converter (B.S. to A.D.)'
            }
          >
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600 dark:text-red-500 shrink-0 group-hover/date:scale-110 transition" />
            <span
              suppressHydrationWarning
              className="font-semibold text-slate-900 dark:text-slate-200 text-[10px] sm:text-[10.5px] whitespace-nowrap group-hover/date:text-red-600 dark:group-hover/date:text-red-400"
            >
              <span className="hidden 2xl:inline">{dateInfo.weekday}, </span>
              <span>{language === 'ne' ? dateInfo.shortNepaliDate : dateInfo.shortEnglishDate}</span>
            </span>
            <span className="text-slate-400 dark:text-slate-600 hidden xs:inline">|</span>
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600 dark:text-red-400 shrink-0 hidden xs:inline group-hover/date:animate-spin" />
            <span
              suppressHydrationWarning
              className="font-bold text-red-600 dark:text-red-400 min-w-[46px] font-mono whitespace-nowrap text-[10px] sm:text-[10.5px] hidden xs:inline"
            >
              {liveTime}
            </span>
          </Link>
        </div>

        {/* ======================================================== */}
        {/* 2. CENTER ZONE: Live Tickers with Animated API Icons (flex-1) */}
        {/* ======================================================== */}
        <div className="hidden lg:flex items-center justify-center gap-2 xl:gap-3 px-2 border-x border-slate-200 dark:border-slate-800 text-[11px] flex-1 min-w-0 whitespace-nowrap">
          
          {/* Animated Broadcast Live Badge */}
          <div
            className="flex items-center gap-1 shrink-0 bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider"
            title="Real-time financial & weather feed auto-updating every 15s"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-90"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>LIVE</span>
          </div>

          {/* 1. Live Weather with Animated Spinning Sun Icon */}
          {weather.enabled && (
            <div
              className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 shrink-0 cursor-default"
              title={`Weather: ${language === 'ne' ? weather.conditionNe : weather.conditionEn}`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500 animate-[spin_10s_linear_infinite] shrink-0 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
              <span className="text-slate-700 dark:text-slate-300">
                {language === 'ne' ? weather.cityNe : weather.cityEn}
              </span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {language === 'ne' ? weather.tempNe || weather.temp : weather.temp}
              </span>
            </div>
          )}

          {/* 2. Bullion Gold with Shimmering Animated Coins Icon */}
          {market.showGold && (
            <>
              <span className="text-slate-300 dark:text-slate-700 shrink-0">•</span>
              <Link
                href="/tools/gold-silver-rate"
                className="flex items-center gap-1 text-slate-700 dark:text-slate-300 shrink-0 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition group/gold"
                title={
                  language === 'ne'
                    ? `विस्तृत सुनचाँदी दर हेर्नुहोस्: छापावाल सुन रु ${market.gold}/तोला`
                    : `View detailed gold & silver rates: Fine Gold Rs ${market.goldEn || market.gold}/tola`
                }
              >
                <Coins className="w-3.5 h-3.5 text-amber-500 animate-coin-shimmer shrink-0 group-hover/gold:scale-110 transition" />
                <span className="text-slate-500 dark:text-slate-400 font-semibold group-hover/gold:text-amber-600 dark:group-hover/gold:text-amber-400">
                  {language === 'ne' ? 'सुन:' : 'Gold:'}
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-300 font-mono">
                  {goldDisplay}
                </span>
              </Link>
            </>
          )}

          {/* 3. NEPSE Stock Market with Animated Trend Arrow */}
          {market.showNepse && (
            <>
              <span className="text-slate-300 dark:text-slate-700 shrink-0">•</span>
              <div
                className="flex items-center gap-1 text-slate-700 dark:text-slate-300 shrink-0 cursor-default"
                title={`NEPSE Index: ${market.nepseEn || market.nepse} ${market.nepseChangeEn || market.nepseChange}`}
              >
                {market.nepsePositive ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500 animate-trend-up shrink-0" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500 animate-trend-down shrink-0" />
                )}
                <span className="text-slate-500 dark:text-slate-400 font-semibold">
                  {language === 'ne' ? 'नेप्से:' : 'NEPSE:'}
                </span>
                <span
                  className={`font-bold font-mono ${
                    market.nepsePositive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {nepseDisplay}
                </span>
                {/* Compact percentage change on normal desktop screens so USD never gets pushed; full change on 2xl */}
                <span
                  className={`text-[10px] font-mono font-semibold hidden xl:inline 2xl:hidden ${
                    market.nepsePositive
                      ? 'text-emerald-600 dark:text-emerald-300'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {nepsePctDisplay}
                </span>
                <span
                  className={`text-[10px] font-mono font-semibold hidden 2xl:inline ${
                    market.nepsePositive
                      ? 'text-emerald-600 dark:text-emerald-300'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {nepseChangeDisplay}
                </span>
              </div>
            </>
          )}

          {/* 4. Forex USD with Pulsing Animated Dollar Icon */}
          {market.showForex && (
            <>
              <span className="text-slate-300 dark:text-slate-700 shrink-0">•</span>
              <Link
                href="/tools/forex-converter"
                className="flex items-center gap-1 text-slate-700 dark:text-slate-300 shrink-0 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition group/forex"
                title={
                  language === 'ne'
                    ? `विस्तृत विदेशी मुद्रा विनिमय दर हेर्नुहोस् (नेपाल राष्ट्र बैंक): १ डलर = रु ${market.usd}`
                    : `View full foreign currency rates (NRB): 1 USD = Rs ${market.usdEn || market.usd}`
                }
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-dollar-pulse shrink-0 group-hover/forex:scale-110 transition" />
                <span className="text-slate-500 dark:text-slate-400 font-semibold group-hover/forex:text-emerald-600 dark:group-hover/forex:text-emerald-400">
                  {language === 'ne' ? 'डलर:' : 'USD:'}
                </span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {usdDisplay}
                </span>
              </Link>
            </>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. RIGHT ZONE: Circular Social Icons, Login, Theme Toggle (shrink-0) */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Times of India-style Circular Social Icons (Facebook, YouTube, Instagram, TikTok) */}
          <div className="hidden lg:flex items-center gap-1 pr-1.5 border-r border-slate-300 dark:border-slate-800">
            {socialLinks.facebook && (
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-5.5 h-5.5 rounded-full border border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition shadow-2xs bg-white dark:bg-slate-900"
                title="Follow on Facebook"
              >
                <FacebookIcon className="w-2.5 h-2.5" />
              </a>
            )}

            {socialLinks.youtube && (
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-5.5 h-5.5 rounded-full border border-red-500/40 text-red-600 dark:text-red-500 hover:bg-red-600 hover:text-white flex items-center justify-center transition shadow-2xs bg-white dark:bg-slate-900"
                title="Subscribe on YouTube"
              >
                <YoutubeIcon className="w-2.5 h-2.5" />
              </a>
            )}

            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-5.5 h-5.5 rounded-full border border-pink-500/40 text-pink-600 dark:text-pink-400 hover:bg-pink-600 hover:text-white flex items-center justify-center transition shadow-2xs bg-white dark:bg-slate-900"
                title="Follow on Instagram"
              >
                <InstagramIcon className="w-2.5 h-2.5" />
              </a>
            )}

            {socialLinks.tiktok && (
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-5.5 h-5.5 rounded-full border border-slate-700 text-black dark:text-white hover:bg-black hover:text-white flex items-center justify-center transition shadow-2xs bg-white dark:bg-slate-900"
                title="Follow on TikTok"
              >
                <TikTokIcon className="w-2.5 h-2.5" />
              </a>
            )}
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <ThemeToggle />
        </div>

      </div>
    </div>
  )
}
