'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/context/language-context'
import {
  FacebookIcon,
  YoutubeIcon,
  InstagramIcon,
  TikTokIcon,
} from '@/components/ui/social-icons'
import {
  MapPin,
  Phone,
  Mail,
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
    tiktok?: string
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
    pressCouncilNo: '',
    deptOfInfoNo: '',
    editorName: '',
    publisherName: '',
  }

  const social = {
    facebook: settings?.socialLinks?.facebook || 'https://facebook.com/sabaichha',
    youtube: settings?.socialLinks?.youtube || 'https://youtube.com/@sabaichha',
    instagram: settings?.socialLinks?.instagram || 'https://instagram.com/sabaichha',
    tiktok: settings?.socialLinks?.tiktok || 'https://tiktok.com/@sabaichha',
  }

  const footerText = settings?.footer || {
    aboutNe:
      'सूचना, विचार र मनोरञ्जनको अग्रणी डिजिटल अनलाइन पत्रिका। हामी निष्पक्ष, तथ्यपरक र जनसरोकारका समाचारहरू छिटो र भरपर्दो रूपमा सम्प्रेषण गर्न सदैव प्रतिबद्ध छौं।',
    aboutEn:
      'Leading digital news portal dedicated to authentic, independent, and timely journalism in Nepal.',
    copyrightText: '© 2026 SabaiChha.com. सर्वाधिकार सुरक्षित।',
  }

  return (
    <footer className="w-full bg-[#0B1120] text-slate-300 border-t-4 border-red-600 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        {/* Top Branding & Social Ribbon */}
        <div className="flex flex-col md:flex-row items-center justify-between pb-10 border-b border-slate-800 gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Link href="/" className="relative h-14 sm:h-20 md:h-22 flex items-center justify-center shrink-0">
              <Image
                src="/logo-transparent.png"
                alt="SabaiChha.com - सबै छ डट कम"
                width={320}
                height={127}
                className="object-contain h-12 sm:h-18 md:h-20 w-auto"
              />
            </Link>
            <div className="sm:border-l sm:border-slate-700 sm:pl-4">
              <p className="text-xs font-bold text-white tracking-wide">
                {language === 'ne' ? siteInfo.sloganNe : siteInfo.sloganEn}
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
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 hover:bg-pink-600 hover:text-white flex items-center justify-center transition shadow-2xs"
                title="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}

            {social.tiktok && (
              <a
                href={social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-slate-700 bg-black text-white hover:bg-slate-800 flex items-center justify-center transition shadow-2xs"
                title="TikTok"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* 2-Column Grid: About & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 border-b border-slate-800 text-xs">
          {/* Col 1: About SabaiChha */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span>{language === 'ne' ? 'हाम्रो बारेमा' : 'About Us'}</span>
            </h4>
            <p className="text-slate-400 leading-relaxed font-serif text-xs">
              {language === 'ne' ? footerText.aboutNe : footerText.aboutEn}
            </p>
            {(siteInfo.deptOfInfoNo || siteInfo.pressCouncilNo || siteInfo.publisherName || siteInfo.editorName) && (
              <div className="pt-1 space-y-1 text-[11px] text-slate-400 border-t border-slate-800/80">
                {siteInfo.deptOfInfoNo && (
                  <p>
                    <span className="text-slate-500">{language === 'ne' ? 'सूचना विभाग दर्ता नं:' : 'Reg. No:'}</span>{' '}
                    <span className="text-slate-300 font-semibold">{siteInfo.deptOfInfoNo}</span>
                  </p>
                )}
                {siteInfo.pressCouncilNo && (
                  <p>
                    <span className="text-slate-500">{language === 'ne' ? 'प्रेस काउन्सिल सूचीकरण:' : 'Press Council:'}</span>{' '}
                    <span className="text-slate-300 font-semibold">{siteInfo.pressCouncilNo}</span>
                  </p>
                )}
                {siteInfo.publisherName && (
                  <p>
                    <span className="text-slate-500">{language === 'ne' ? 'अध्यक्ष/प्रकाशक:' : 'Publisher:'}</span>{' '}
                    <span className="text-slate-300 font-semibold">{siteInfo.publisherName}</span>
                  </p>
                )}
                {siteInfo.editorName && (
                  <p>
                    <span className="text-slate-500">{language === 'ne' ? 'सम्पादक:' : 'Editor:'}</span>{' '}
                    <span className="text-slate-300 font-semibold">{siteInfo.editorName}</span>
                  </p>
                )}
              </div>
            )}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <Link href="/contact" className="hover:text-red-400 transition underline underline-offset-2">
                {language === 'ne' ? 'सम्पर्क' : 'Contact'}
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-red-400 transition underline underline-offset-2">
                {language === 'ne' ? 'गोपनीयता नीति' : 'Privacy Policy'}
              </Link>
            </div>
          </div>

          {/* Col 2: Contact & Office */}
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
            <Link href="/contact" className="hover:text-slate-300 transition">
              सम्पर्क (Contact Us)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
