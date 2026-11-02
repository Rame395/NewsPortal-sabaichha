'use client'

import * as React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/language-context'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { formatBikramSambat, formatNepaliTime } from '@/lib/date/nepali-calendar'
import {
  FacebookIcon,
  TwitterXIcon,
  YoutubeIcon,
  InstagramIcon,
  LinkedinIcon,
  TelegramIcon,
} from '@/components/ui/social-icons'
import {
  Calendar,
  Clock,
  Shield,
  Coins,
  TrendingUp,
  Newspaper,
  MapPin,
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
    silver: string
    showGold: boolean
    nepse: string
    nepseChange: string
    nepsePositive: boolean
    showNepse: boolean
    usd: string
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
  }
}

export function TopUtilityBar() {
  const { language, t } = useLanguage()

  // Real-time date & live ticking clock
  const [dateDisplay, setDateDisplay] = React.useState<string>(() => {
    const bs = formatBikramSambat(new Date())
    return bs.fullNepaliDate
  })
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
      setDateDisplay(language === 'ne' ? bs.fullNepaliDate : bs.fullEnglishDate)
      setLiveTime(language === 'ne' ? tm.nepali : tm.english)
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [language])

  // Fetch real-time weather and market tickers
  React.useEffect(() => {
    let isMounted = true
    fetch('/api/public/market-weather')
      .then((res) => res.json())
      .then((resData) => {
        if (isMounted && resData && !resData.error) {
          setData(resData)
        }
      })
      .catch((err) => console.error('Failed to load market-weather:', err))

    return () => {
      isMounted = false
    }
  }, [])

  const socialLinks = data?.social || {
    facebook: 'https://facebook.com/sabaichha',
    twitter: 'https://x.com/sabaichha',
    youtube: 'https://youtube.com/@sabaichha',
    instagram: 'https://instagram.com/sabaichha',
    linkedin: 'https://linkedin.com/company/sabaichha',
    telegram: 'https://t.me/sabaichha',
  }

  const weather = data?.weather || {
    cityNe: 'काठमाडौँ',
    cityEn: 'Kathmandu',
    temp: '15°C',
    tempNe: '१५°C',
    conditionNe: 'हल्का वर्षा',
    conditionEn: 'Rain',
    icon: 'rain',
    enabled: true,
  }

  const market = data?.market || {
    gold: '१,६८,५००',
    silver: '२,१५०',
    showGold: true,
    nepse: '२,७४२.१८',
    nepseChange: '+१४.२५',
    nepsePositive: true,
    showNepse: true,
    usd: '१५२.०८',
    showForex: true,
  }

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 border-b border-slate-200/90 dark:border-slate-800 text-[11px] h-9.5 px-3 sm:px-6 transition-colors select-none flex items-center">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-3 overflow-hidden">
        
        {/* LEFT & CENTER: Edition, Language, Live Clock, Weather & Financial Tickers */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 overflow-hidden whitespace-nowrap">
          {/* Edition Pill */}
          <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 shrink-0">
            <span className="hidden sm:inline">Edition</span>
            <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 shadow-2xs font-semibold">
              <span>🇳🇵 NP</span>
            </span>
          </div>

          {/* Divider */}
          <span className="h-3.5 w-px bg-slate-300 dark:bg-slate-700 shrink-0" />

          {/* Language Toggle with Google Translate Dropdown */}
          <div className="shrink-0">
            <LanguageToggle />
          </div>

          {/* Divider */}
          <span className="h-3.5 w-px bg-slate-300 dark:bg-slate-700 shrink-0" />

          {/* Real-Time Live Clock */}
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-red-600 dark:text-red-500 shrink-0" />
            <span suppressHydrationWarning className="font-semibold text-slate-900 dark:text-slate-200 text-[11px]">
              {dateDisplay}
            </span>
            <span className="text-slate-400 dark:text-slate-600">|</span>
            <Clock className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
            <span
              suppressHydrationWarning
              className="font-bold text-red-600 dark:text-red-400 min-w-[55px] font-mono"
            >
              {liveTime}
            </span>
          </div>

          {/* TICKERS: Weather, Gold, NEPSE, Forex (Single clean horizontal row) */}
          <div className="hidden lg:flex items-center gap-2.5 pl-2.5 border-l border-slate-300 dark:border-slate-700 text-[11px] shrink-0">
            {/* Live Weather */}
            {weather.enabled && (
              <div
                className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400"
                title={`Weather: ${language === 'ne' ? weather.conditionNe : weather.conditionEn}`}
              >
                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">
                  {language === 'ne' ? weather.cityNe : weather.cityEn}
                </span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {language === 'ne' ? weather.tempNe || weather.temp : weather.temp}
                </span>
              </div>
            )}

            {/* Bullion Gold Rate */}
            {market.showGold && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <Coins className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="text-slate-500 dark:text-slate-400">{language === 'ne' ? 'सुन:' : 'Gold:'}</span>
                  <span className="font-bold text-amber-600 dark:text-amber-300 font-mono">रु {market.gold}</span>
                </div>
              </>
            )}

            {/* NEPSE Stock Market */}
            {market.showNepse && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-slate-500 dark:text-slate-400">नेप्से:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{market.nepse}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-mono font-semibold hidden 2xl:inline">
                    {market.nepseChange}
                  </span>
                </div>
              </>
            )}

            {/* Forex USD */}
            {market.showForex && (
              <>
                <span className="text-slate-300 dark:text-slate-700 hidden xl:inline">•</span>
                <div className="hidden xl:flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">$ USD:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">रु {market.usd}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Circular Social Icons, ePaper, Login, Theme Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Times of India-style Circular Social Icons */}
          <div className="hidden xl:flex items-center gap-1 pr-1.5 border-r border-slate-300 dark:border-slate-800">
            {socialLinks.facebook && (
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noreferrer"
                className="w-5.5 h-5.5 rounded-full border border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition shadow-2xs bg-white dark:bg-slate-900"
                title="Follow on Facebook"
              >
                <FacebookIcon className="w-2.5 h-2.5" />
              </a>
            )}

            {socialLinks.twitter && (
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="w-5.5 h-5.5 rounded-full border border-slate-400 dark:border-slate-600 text-slate-800 dark:text-slate-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center justify-center transition shadow-2xs bg-white dark:bg-slate-900"
                title="Follow on X / Twitter"
              >
                <TwitterXIcon className="w-2.5 h-2.5" />
              </a>
            )}

            {socialLinks.youtube && (
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noreferrer"
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
                rel="noreferrer"
                className="w-5.5 h-5.5 rounded-full border border-pink-500/40 text-pink-600 dark:text-pink-400 hover:bg-pink-600 hover:text-white flex items-center justify-center transition shadow-2xs bg-white dark:bg-slate-900"
                title="Follow on Instagram"
              >
                <InstagramIcon className="w-2.5 h-2.5" />
              </a>
            )}

            {socialLinks.linkedin && (
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="w-5.5 h-5.5 rounded-full border border-sky-500/40 text-sky-600 dark:text-sky-400 hover:bg-sky-600 hover:text-white flex items-center justify-center transition shadow-2xs bg-white dark:bg-slate-900"
                title="Follow on LinkedIn"
              >
                <LinkedinIcon className="w-2.5 h-2.5" />
              </a>
            )}

            {socialLinks.telegram && (
              <a
                href={socialLinks.telegram}
                target="_blank"
                rel="noreferrer"
                className="w-5.5 h-5.5 rounded-full border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white flex items-center justify-center transition shadow-2xs bg-white dark:bg-slate-900"
                title="Join Telegram Channel"
              >
                <TelegramIcon className="w-2.5 h-2.5" />
              </a>
            )}
          </div>

          {/* Read ePaper Pill (TOI style) */}
          <Link
            href="/epaper"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-red-600 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white text-[10px] font-bold transition shadow-2xs bg-white dark:bg-slate-900 whitespace-nowrap"
            title="Read ePaper / ई-पत्रिका"
          >
            <Newspaper className="w-3 h-3 text-red-600 dark:text-red-400" />
            <span>{language === 'ne' ? 'ई-पत्रिका' : 'Read ePaper'}</span>
          </Link>

          {/* Staff Login */}
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 text-slate-700 dark:text-slate-200 text-[10px] font-bold transition border border-slate-300 dark:border-slate-700 hover:border-red-600 shadow-2xs whitespace-nowrap"
            title="Editorial Sign In"
          >
            <Shield className="w-3 h-3 text-red-600" />
            <span>{t('login')}</span>
          </Link>

          {/* Theme Toggle (Light / Dark) */}
          <ThemeToggle />
        </div>

      </div>
    </div>
  )
}
