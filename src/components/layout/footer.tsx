'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/context/language-context'
import {
  FacebookIcon,
  TwitterXIcon,
  YoutubeIcon,
  InstagramIcon,
  LinkedinIcon,
  TelegramIcon,
} from '@/components/ui/social-icons'
import {
  MapPin,
  Phone,
  Mail,
  Shield,
  Newspaper,
  ChevronRight,
  Send,
} from 'lucide-react'

interface FooterProps {
  categories?: { id: number; nameEn: string; nameNe: string; slug: string }[]
}

interface SiteSettingsState {
  siteInfo: {
    portalName: string
    sloganNe: string
    sloganEn: string
    addressNe: string
    addressEn: string
    phone: string
    email: string
    pressCouncilNo: string
    deptOfInfoNo: string
    editorName: string
    publisherName: string
  }
  socialLinks: {
    facebook: string
    twitter: string
    youtube: string
    instagram: string
    linkedin: string
    telegram: string
  }
  footer: {
    aboutNe: string
    aboutEn: string
    copyrightText: string
  }
}

export function Footer({ categories = [] }: FooterProps) {
  const { language } = useLanguage()

  const [settings, setSettings] = React.useState<SiteSettingsState | null>(null)

  React.useEffect(() => {
    fetch('/api/public/market-weather')
      .then((res) => res.json())
      .then((resData) => {
        if (!resData.error && resData.social) {
          // Also fetch full settings if available
          fetch('/api/settings')
            .then((r) => r.json())
            .then((sData) => {
              if (sData.settings) setSettings(sData.settings)
            })
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [])

  const siteInfo = settings?.siteInfo || {
    portalName: 'SabaiChha.com',
    sloganNe: 'सूचना संवाद र मनोरञ्जनको संगम, सबै छ डट कम',
    sloganEn: 'Confluence of Information, Dialogue & Entertainment',
    addressNe: 'काठमाडौँ महानगरपालिका, बागमती प्रदेश, नेपाल',
    addressEn: 'Kathmandu Metropolitan City, Bagmati Province, Nepal',
    phone: '+977 1-4240000 / 9851000000',
    email: 'info@sabaichha.com',
    pressCouncilNo: 'प्रेस काउन्सिल दर्ता नं.: १२३/०८०-८१',
    deptOfInfoNo: 'सूचना विभाग दर्ता नं.: ५३२७',
    editorName: 'सन्तोष श्रेष्ठ (प्रधान सम्पादक)',
    publisherName: 'सबै छ मिडिया नेटवर्क प्रा. लि.',
  }

  const social = settings?.socialLinks || {
    facebook: 'https://facebook.com/sabaichha',
    twitter: 'https://x.com/sabaichha',
    youtube: 'https://youtube.com/@sabaichha',
    instagram: 'https://instagram.com/sabaichha',
    linkedin: 'https://linkedin.com/company/sabaichha',
    telegram: 'https://t.me/sabaichha',
  }

  const footerText = settings?.footer || {
    aboutNe:
      'सूचना, विचार र मनोरञ्जनको अग्रणी डिजिटल अनलाइन पत्रिका। हामी निष्पक्ष, तथ्यपरक र जनसरोकारका समाचारहरू छिटो र भरपर्दो रूपमा सम्प्रेषण गर्न सदैव प्रतिबद्ध छौं।',
    aboutEn:
      'Leading digital news portal dedicated to authentic, independent, and timely journalism in Nepal.',
    copyrightText: '© 2026 SabaiChha.com. सर्वाधिकार सुरक्षित।',
  }

  const defaultCategories = categories.length > 0 ? categories : [
    { id: 1, nameEn: 'Politics', nameNe: 'राजनीति', slug: 'politics' },
    { id: 2, nameEn: 'Society', nameNe: 'समाज', slug: 'society' },
    { id: 3, nameEn: 'Economy', nameNe: 'अर्थ / बजार', slug: 'economy' },
    { id: 4, nameEn: 'Opinion', nameNe: 'विचार', slug: 'opinion' },
    { id: 5, nameEn: 'Sports', nameNe: 'खेलकुद', slug: 'sports' },
    { id: 6, nameEn: 'World', nameNe: 'विश्व', slug: 'world' },
  ]

  return (
    <footer className="w-full bg-[#0B1120] text-slate-300 border-t-4 border-red-600 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        {/* Top Branding & Social Ribbon */}
        <div className="flex flex-col md:flex-row items-center justify-between pb-10 border-b border-slate-800 gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Link href="/" className="relative h-14 w-60 bg-white rounded-xl p-1.5 flex items-center shrink-0">
              <Image
                src="/logo.jpg"
                alt="SabaiChha.com - सबै छ डट कम"
                width={240}
                height={56}
                className="object-contain max-h-12 w-auto"
              />
            </Link>
            <div className="sm:border-l sm:border-slate-700 sm:pl-4">
              <p className="text-xs font-bold text-white tracking-wide">
                {language === 'ne' ? siteInfo.sloganNe : siteInfo.sloganEn}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'ne' ? siteInfo.publisherName : 'SabaiChha Media Network Pvt. Ltd.'}
              </p>
            </div>
          </div>

          {/* Times of India-style Circular Social Icons Row */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-2 hidden lg:inline">
              {language === 'ne' ? 'हामीसँग जोडिनुहोस्:' : 'Follow Us:'}
            </span>

            {social.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition shadow-2xs"
                title="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            )}

            {social.twitter && (
              <a
                href={social.twitter}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-slate-700 bg-slate-800 text-slate-200 hover:bg-white hover:text-black flex items-center justify-center transition shadow-2xs"
                title="X (Twitter)"
              >
                <TwitterXIcon className="w-3.5 h-3.5" />
              </a>
            )}

            {social.youtube && (
              <a
                href={social.youtube}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white flex items-center justify-center transition shadow-2xs"
                title="YouTube"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
            )}

            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 hover:bg-pink-600 hover:text-white flex items-center justify-center transition shadow-2xs"
                title="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}

            {social.linkedin && (
              <a
                href={social.linkedin}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-600 hover:text-white flex items-center justify-center transition shadow-2xs"
                title="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            )}

            {social.telegram && (
              <a
                href={social.telegram}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white flex items-center justify-center transition shadow-2xs"
                title="Telegram"
              >
                <TelegramIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* 5-Column Grid: About, Categories, Utility Tools, Legal & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 py-10 border-b border-slate-800 text-xs">
          {/* Col 1: About SabaiChha */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span>{language === 'ne' ? 'हाम्रो बारेमा' : 'About Us'}</span>
            </h4>
            <p className="text-slate-400 leading-relaxed font-serif text-xs">
              {language === 'ne' ? footerText.aboutNe : footerText.aboutEn}
            </p>
            <div className="pt-2 text-[11px] text-slate-400 space-y-1">
              <p>
                <span className="font-bold text-slate-300">
                  {language === 'ne' ? 'सम्पादकीय नेतृत्व:' : 'Editor-in-Chief:'}
                </span>{' '}
                {siteInfo.editorName}
              </p>
            </div>
          </div>

          {/* Col 2: News Sections */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span>{language === 'ne' ? 'प्रमुख विधाहरू' : 'News Categories'}</span>
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              {defaultCategories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="hover:text-red-400 transition flex items-center gap-1"
                  >
                    <ChevronRight className="w-3 h-3 text-red-500" />
                    <span>{language === 'ne' ? c.nameNe : c.nameEn}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Utility Tools (SEO Powerhouse) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>{language === 'ne' ? 'उपयोगी टुल्स' : 'Utility Tools'}</span>
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link href="/tools/gold-silver-rate" className="hover:text-amber-400 transition flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-amber-500" />
                  <span>{language === 'ne' ? 'सुनचाँदीको भाउ' : 'Gold & Silver Rates'}</span>
                </Link>
              </li>
              <li>
                <Link href="/tools/date-converter" className="hover:text-amber-400 transition flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-amber-500" />
                  <span>{language === 'ne' ? 'नेपाली मिति रूपान्तरक' : 'Date Converter'}</span>
                </Link>
              </li>
              <li>
                <Link href="/tools/forex-converter" className="hover:text-amber-400 transition flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-amber-500" />
                  <span>{language === 'ne' ? 'विदेशी मुद्रा विनिमय' : 'Forex Rates'}</span>
                </Link>
              </li>
              <li>
                <Link href="/tools/nepali-unicode" className="hover:text-amber-400 transition flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-amber-500" />
                  <span>{language === 'ne' ? 'नेपाली युनिकोड' : 'Nepali Unicode'}</span>
                </Link>
              </li>
              <li>
                <Link href="/rashifal" className="hover:text-amber-400 transition flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-amber-500" />
                  <span>{language === 'ne' ? 'दैनिक राशिफल' : 'Daily Horoscope'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Publisher & Editorial Board (matching thurpaonline & nepali standards) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span>{language === 'ne' ? 'सम्पादकीय समूह' : 'Editorial Board'}</span>
            </h4>
            <div className="space-y-2 text-slate-300 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  {language === 'ne' ? 'सञ्चालक / अध्यक्ष:' : 'Publisher / Chairman:'}
                </span>
                <span className="font-bold text-white">{siteInfo.publisherName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  {language === 'ne' ? 'प्रधान सम्पादक:' : 'Editor-in-Chief:'}
                </span>
                <span className="font-bold text-white">{siteInfo.editorName}</span>
              </div>
              <div className="pt-1.5 space-y-1.5 font-mono text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-blue-300 font-semibold">{siteInfo.deptOfInfoNo}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{siteInfo.pressCouncilNo}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 pt-1 font-sans">
                {language === 'ne'
                  ? 'प्रेस काउन्सिल नेपालको पत्रकार आचारसंहिताअनुसार सञ्चालित।'
                  : 'Operating in accordance with Press Council Nepal ethical standards.'}
              </p>
            </div>
          </div>

          {/* Col 4: Contact & Office */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span>{language === 'ne' ? 'कार्यालय सम्पर्क' : 'Contact Office'}</span>
            </h4>
            <div className="space-y-2.5 text-slate-400 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{language === 'ne' ? siteInfo.addressNe : siteInfo.addressEn}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-mono">{siteInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href={`mailto:${siteInfo.email}`} className="font-mono hover:text-white underline">
                  {siteInfo.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{footerText.copyrightText}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-300 transition">
              गोपनीयता नीति (Privacy Policy)
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-300 transition">
              नियम तथा सर्तहरू (Terms)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
