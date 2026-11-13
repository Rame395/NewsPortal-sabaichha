'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/context/language-context'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import {
  Menu,
  X,
  Home,
  Flame,
  Sparkles,
  Wrench,
  Calendar,
  Coins,
  DollarSign,
  Keyboard,
  Bookmark,
  ChevronRight,
  ShieldCheck,
  PhoneCall,
  Info,
  ExternalLink,
  MapPin,
  Users,
} from 'lucide-react'
import { PROVINCES } from '@/lib/constants/provinces'
import {
  FacebookIcon,
  YoutubeIcon,
  InstagramIcon,
  TikTokIcon,
} from '@/components/ui/social-icons'

interface CategoryItem {
  id: number
  nameEn: string
  nameNe: string
  slug: string
}

interface MobileNavDrawerProps {
  categories: CategoryItem[]
}

const DEFAULT_SOCIAL = {
  facebook: 'https://facebook.com/sabaichha',
  youtube: 'https://youtube.com/@sabaichha',
  instagram: 'https://instagram.com/sabaichha',
  tiktok: 'https://tiktok.com/@sabaichha',
}

export function MobileNavDrawer({ categories }: MobileNavDrawerProps) {
  const pathname = usePathname()
  const { language, t } = useLanguage()
  const isNe = language === 'ne'
  const [isOpen, setIsOpen] = React.useState(false)
  const [socialLinks, setSocialLinks] = React.useState(DEFAULT_SOCIAL)

  // Fetch configured social links from server
  React.useEffect(() => {
    fetch('/api/public/market-weather', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.social) {
          setSocialLinks({
            facebook: data.social.facebook || DEFAULT_SOCIAL.facebook,
            youtube: data.social.youtube || DEFAULT_SOCIAL.youtube,
            instagram: data.social.instagram || DEFAULT_SOCIAL.instagram,
            tiktok: data.social.tiktok || DEFAULT_SOCIAL.tiktok,
          })
        }
      })
      .catch(() => {})
  }, [])

  // Close drawer automatically whenever route changes
  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent background body scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toolsList = [
    {
      href: '/rashifal',
      labelNe: 'दैनिक राशिफल',
      labelEn: 'Daily Horoscope',
      descNe: 'आजको १२ राशिको भविष्यफल',
      descEn: 'Daily zodiac predictions',
      icon: Sparkles,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40',
    },
    {
      href: '/tools/date-converter',
      labelNe: 'नेपाली मिति रूपान्तरक',
      labelEn: 'Date Converter (B.S. ⇄ A.D.)',
      descNe: 'विक्रम संवत् र इस्वी संवत्',
      descEn: 'Convert BS to AD and vice versa',
      icon: Calendar,
      color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40',
    },
    {
      href: '/tools/gold-silver-rate',
      labelNe: 'सुनचाँदीको भाउ',
      labelEn: 'Gold & Silver Rates',
      descNe: 'दैनिक आधिकारिक दरभाउ',
      descEn: 'Official daily bullion rates',
      icon: Coins,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
    },
    {
      href: '/tools/forex-converter',
      labelNe: 'विदेशी मुद्रा विनिमय दर',
      labelEn: 'Forex Exchange Rates',
      descNe: 'नेपाल राष्ट्र बैंकको दर',
      descEn: 'NRB foreign exchange rates',
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      href: '/tools/nepali-unicode',
      labelNe: 'नेपाली युनिकोड रूपान्तरक',
      labelEn: 'Nepali Unicode Converter',
      descNe: 'परम्परागत र रोपनाइज्ड टाइप',
      descEn: 'Traditional & Romanized typing',
      icon: Keyboard,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
    },
  ]

  return (
    <>
      {/* 1. Mobile Hamburger Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg text-white hover:bg-white/10 transition cursor-pointer"
        aria-label="Open Navigation Menu"
        title={isNe ? 'सबै विधा र मेनु खोल्नुहोस्' : 'Open All Navigation Menu'}
      >
        <Menu className="w-5 h-5 text-amber-300 sm:text-white" />
        <span className="font-extrabold uppercase tracking-wide text-[11px] sm:text-xs">
          {isNe ? 'मेनु' : 'Menu'}
        </span>
      </button>

      {/* 2. Slide-over Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-300 overflow-hidden">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between">
              <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                <div className="relative h-14 bg-white rounded-xl px-2.5 py-1 shadow-2xs flex items-center justify-center">
                  <Image
                    src="/logo-v2.jpg"
                    alt="SabaiChha.com - सबै छ डट कम"
                    width={240}
                    height={100}
                    className="object-contain h-12 w-auto"
                  />
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-4 space-y-5">
              
              {/* Home & Quick Top Links */}
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-sm transition ${
                    pathname === '/'
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-extrabold'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-red-600" />
                    <span>{isNe ? 'गृहपृष्ठ (Home)' : 'Home'}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Province News Section (प्रदेश समाचार - ७ प्रदेश) */}
              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {isNe ? 'प्रदेश समाचार' : 'Province News'}
                  </span>
                  <span className="text-[10px] font-mono text-[#02267C] dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">
                    {isNe ? '७ प्रदेश' : '7 Provinces'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {PROVINCES.map((prov) => {
                    const isActive = pathname === `/province/${prov.slug}`
                    return (
                      <Link
                        key={prov.slug}
                        href={`/province/${prov.slug}`}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                          isActive
                            ? 'bg-[#02267C] text-white shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{isNe ? prov.nameNe : prov.nameEn}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* News Categories Section */}
              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {isNe ? 'समाचार विधाहरू' : 'News Categories'}
                  </span>
                  <span className="text-[10px] font-mono text-red-600 font-bold bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full">
                    {categories.length} {isNe ? 'विधा' : 'sections'}
                  </span>
                </div>

                <div className="space-y-1">
                  {categories.map((cat) => {
                    const isActive =
                      pathname === `/category/${cat.slug}` ||
                      pathname.startsWith(`/category/${cat.slug}/`)

                    return (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition ${
                          isActive
                            ? 'bg-red-600 text-white font-bold shadow-xs'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-white' : 'bg-red-500'
                            }`}
                          />
                          <span>{isNe ? cat.nameNe : cat.nameEn}</span>
                        </span>
                        <span
                          className={`text-xs ${
                            isActive ? 'text-red-100' : 'text-slate-400'
                          }`}
                        >
                          {isNe ? cat.nameEn : cat.nameNe}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Useful Tools & Services Section */}
              <div className="pt-4 space-y-2">
                <div className="flex items-center gap-1.5 px-2">
                  <Wrench className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {isNe ? 'उपयोगी टुल्स तथा सेवाहरू' : 'Utilities & Tools'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {toolsList.map((tool) => {
                    const isActive = pathname === tool.href
                    const Icon = tool.icon

                    return (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition ${
                          isActive
                            ? 'border-red-600 bg-red-50/50 dark:bg-red-950/20'
                            : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tool.color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {isNe ? tool.labelNe : tool.labelEn}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {isNe ? tool.descNe : tool.descEn}
                          </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Portal Information & Policies */}
              <div className="pt-4 space-y-1">
                <Link
                  href="/our-team"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 transition"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{isNe ? 'हाम्रो टिम (Our Team)' : 'Our Team'}</span>
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isNe ? 'सम्पर्क तथा सम्पादकीय (Contact)' : 'Contact Us'}</span>
                </Link>

                <Link
                  href="/privacy"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isNe ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}</span>
                </Link>
              </div>

              {/* Social Media Channels (हामीसँग जोडिनुहोस् / Follow Us) */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="px-1 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isNe ? 'हामीसँग जोडिनुहोस्' : 'Connect with Us'}
                  </span>
                  <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">
                    SabaiChha
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-2 rounded-xl border border-blue-500/20 bg-blue-50/60 dark:bg-blue-950/30 text-[#1877F2] hover:bg-blue-600 hover:text-white transition group shadow-2xs"
                      title="Facebook"
                    >
                      <FacebookIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition" />
                      <span className="text-[9px] sm:text-[10px] font-bold mt-1 text-slate-700 dark:text-slate-300 group-hover:text-white truncate">
                        FB
                      </span>
                    </a>
                  )}

                  {socialLinks.youtube && (
                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-2 rounded-xl border border-red-500/20 bg-red-50/60 dark:bg-red-950/30 text-[#FF0000] hover:bg-red-600 hover:text-white transition group shadow-2xs"
                      title="YouTube"
                    >
                      <YoutubeIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition" />
                      <span className="text-[9px] sm:text-[10px] font-bold mt-1 text-slate-700 dark:text-slate-300 group-hover:text-white truncate">
                        YT
                      </span>
                    </a>
                  )}

                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-2 rounded-xl border border-pink-500/20 bg-pink-50/60 dark:bg-pink-950/30 text-[#E4405F] hover:bg-pink-600 hover:text-white transition group shadow-2xs"
                      title="Instagram"
                    >
                      <InstagramIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition" />
                      <span className="text-[9px] sm:text-[10px] font-bold mt-1 text-slate-700 dark:text-slate-300 group-hover:text-white truncate">
                        Insta
                      </span>
                    </a>
                  )}

                  {socialLinks.tiktok && (
                    <a
                      href={socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-700/30 bg-slate-100/80 dark:bg-slate-800/80 text-black dark:text-white hover:bg-black hover:text-white transition group shadow-2xs"
                      title="TikTok"
                    >
                      <TikTokIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition" />
                      <span className="text-[9px] sm:text-[10px] font-bold mt-1 text-slate-700 dark:text-slate-300 group-hover:text-white truncate">
                        TikTok
                      </span>
                    </a>
                  )}
                </div>
              </div>

            </div>

            {/* Drawer Footer: Preferences & Quick Controls */}
            <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <LanguageToggle />
                <ThemeToggle />
              </div>

              <span className="text-[10px] text-slate-400 font-mono">
                v1.0 • SabaiChha
              </span>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
