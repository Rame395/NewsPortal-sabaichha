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
  Sun,
  Cloud,
  CloudRain,
  TrendingUp,
  Coins,
  Newspaper,
  MapPin,
  ChevronDown,
} from 'lucide-react'

interface MarketWeatherData {
  weather: {
    cityNe: string
    cityEn: string
    temp: string
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

  const [dateDisplay, setDateDisplay] = React.useState<string>('आइतबार, कार्तिक १६, २०८३')
  const [liveTime, setLiveTime] = React.useState<string>('२२:५५:४१')
  const [data, setData] = React.useState<MarketWeatherData | null>(null)

  // Live ticking 24h/Bikram Sambat clock
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
    fetch('/api/public/market-weather')
      .then((res) => res.json())
      .then((resData) => {
        if (!resData.error) {
          setData(resData)
        }
      })
      .catch((err) => console.error('Failed to load market-weather:', err))
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
    temp: '22°C',
    conditionNe: 'पारिलो घाम',
    conditionEn: 'Sunny',
    icon: 'sun',
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
    usd: '१३४.८०',
    showForex: true,
  }

  return (
    <div className="bg-[#0F172A] text-slate-200 border-b border-slate-800 text-[11px] py-1.5 px-3 sm:px-6 transition-colors select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* LEFT: Edition & Language & Live Clock */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Edition Flag */}
          <div className="flex items-center gap-1.5 font-bold text-slate-300 pr-2 border-r border-slate-700/80">
            <span>Edition</span>
            <span className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-white">
              <span>🇳🇵 NP</span>
            </span>
          </div>

          {/* Language Toggle */}
          <div className="pr-2 border-r border-slate-700/80">
            <LanguageToggle />
          </div>

          {/* Real-Time Live Clock */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <Calendar className="w-3 h-3 text-red-500" />
            <span suppressHydrationWarning className="font-medium">
              {dateDisplay}
            </span>
            <span className="text-slate-600">|</span>
            <Clock className="w-3 h-3 text-red-400" />
            <span suppressHydrationWarning className="font-bold text-white min-w-[55px] font-mono">
              {liveTime}
            </span>
          </div>

          {/* MIDDLE: Weather & Financial Rates (TOI style) */}
          <div className="hidden xl:flex items-center gap-3 pl-3 border-l border-slate-700/80 text-[11px]">
            {/* Live Weather */}
            {weather.enabled && (
              <div className="flex items-center gap-1 font-semibold text-amber-400" title={`Weather: ${weather.conditionNe}`}>
                <MapPin className="w-3 h-3 text-red-400" />
                <span className="text-slate-300">{language === 'ne' ? weather.cityNe : weather.cityEn}</span>
                <span className="font-bold text-white">{weather.temp}</span>
              </div>
            )}

            {/* Bullion Gold Rate */}
            {market.showGold && (
              <div className="flex items-center gap-1 text-slate-300">
                <Coins className="w-3 h-3 text-amber-400" />
                <span className="text-slate-400">{language === 'ne' ? 'सुन:' : 'Gold:'}</span>
                <span className="font-bold text-amber-300 font-mono">रु {market.gold}</span>
              </div>
            )}

            {/* NEPSE Stock Market */}
            {market.showNepse && (
              <div className="flex items-center gap-1 text-slate-300">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-slate-400">नेप्से:</span>
                <span className="font-bold text-emerald-400 font-mono">{market.nepse}</span>
                <span className="text-[10px] text-emerald-300 font-mono">{market.nepseChange}</span>
              </div>
            )}

            {/* Forex USD */}
            {market.showForex && (
              <div className="flex items-center gap-1 text-slate-300">
                <span className="text-slate-400">$ USD:</span>
                <span className="font-bold text-white font-mono">रु {market.usd}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Circular Social Icons, ePaper, Login, Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Times of India-style Circular Social Icons */}
          <div className="hidden md:flex items-center gap-1.5 pr-2 border-r border-slate-800">
            {socialLinks.facebook && (
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noreferrer"
                className="w-6 h-6 rounded-full border border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition shadow-2xs"
                title="Follow on Facebook"
              >
                <FacebookIcon className="w-3 h-3" />
              </a>
            )}

            {socialLinks.twitter && (
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="w-6 h-6 rounded-full border border-slate-600 text-slate-300 hover:bg-white hover:text-black flex items-center justify-center transition shadow-2xs"
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
                className="w-6 h-6 rounded-full border border-red-500/40 text-red-500 hover:bg-red-600 hover:text-white flex items-center justify-center transition shadow-2xs"
                title="Subscribe on YouTube"
              >
                <YoutubeIcon className="w-3 h-3" />
              </a>
            )}

            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-6 h-6 rounded-full border border-pink-500/40 text-pink-400 hover:bg-pink-600 hover:text-white flex items-center justify-center transition shadow-2xs"
                title="Follow on Instagram"
              >
                <InstagramIcon className="w-3 h-3" />
              </a>
            )}

            {socialLinks.linkedin && (
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="w-6 h-6 rounded-full border border-sky-500/40 text-sky-400 hover:bg-sky-600 hover:text-white flex items-center justify-center transition shadow-2xs"
                title="Follow on LinkedIn"
              >
                <LinkedinIcon className="w-3 h-3" />
              </a>
            )}

            {socialLinks.telegram && (
              <a
                href={socialLinks.telegram}
                target="_blank"
                rel="noreferrer"
                className="w-6 h-6 rounded-full border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-white flex items-center justify-center transition shadow-2xs"
                title="Join Telegram Channel"
              >
                <TelegramIcon className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Read ePaper Pill (TOI style) */}
          <Link
            href="/epaper"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-red-600/60 text-red-400 hover:bg-red-600 hover:text-white text-[10px] font-bold transition"
            title="Read ePaper / ई-पत्रिका"
          >
            <Newspaper className="w-3 h-3" />
            <span>{language === 'ne' ? 'ई-पत्रिका' : 'Read ePaper'}</span>
          </Link>

          {/* Staff Login */}
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-red-600 hover:text-white text-slate-200 text-[10px] font-bold transition border border-slate-700 hover:border-red-600"
            title="Editorial Sign In"
          >
            <Shield className="w-3 h-3 text-red-500" />
            <span>{t('login')}</span>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
