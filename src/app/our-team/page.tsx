import * as React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import { getSiteSettings } from '@/lib/settings'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import {
  Users,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Sparkles,
  Building,
  UserCheck,
  Award,
} from 'lucide-react'

export const revalidate = 60

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabaichha.com'

export const metadata: Metadata = {
  title: 'हाम्रो टिम (Our Team) | SabaiChha.com',
  description:
    'सबै छ डट कम (SabaiChha.com) को सम्पादकीय मण्डल, नेतृत्व तथा सञ्चालक समूहको विवरण। सूचना विभाग दर्ता नं. ५३२७।',
  alternates: {
    canonical: `${SITE_URL}/our-team`,
  },
  openGraph: {
    title: 'हाम्रो टिम (Our Team) | SabaiChha.com',
    description:
      'सबै छ डट कम (SabaiChha.com) को सम्पादकीय मण्डल, नेतृत्व तथा सञ्चालक समूहको विवरण। सूचना विभाग दर्ता नं. ५३२७।',
    url: `${SITE_URL}/our-team`,
    siteName: 'SabaiChha.com | सबै छ डट कम',
    type: 'website',
    locale: 'ne_NP',
  },
}

export default async function OurTeamPage() {
  const [categories, settings] = await Promise.all([
    prisma.category.findMany({
      where: { showInMenu: true },
      orderBy: { orderIndex: 'asc' },
      select: { id: true, nameEn: true, nameNe: true, slug: true },
    }),
    getSiteSettings(),
  ])

  const team = settings.team
  const siteInfo = settings.siteInfo
  const members = (team?.members || []).filter((m) => m.isActive)

  // Group members into Leadership vs Other Team
  const leadership = members.filter((m) => m.department === 'LEADERSHIP')
  const others = members.filter((m) => m.department !== 'LEADERSHIP')

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header categories={categories} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-red-600 transition">
            गृहपृष्ठ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-red-600 dark:text-red-400">
            {team?.titleNe || 'हाम्रो टिम'}
          </span>
        </nav>

        {/* Hero Title Section with Glowing Red Pillar */}
        <div className="relative pb-6 border-b-2 border-slate-200/90 dark:border-slate-800 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <span className="absolute -bottom-[2px] left-0 w-32 sm:w-48 h-[2px] bg-red-600 rounded-full" />
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-center gap-1.5 shadow-2xs">
                <Users className="w-3.5 h-3.5" />
                <span>सम्पादकीय मण्डल</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-9 sm:h-11 rounded-full bg-gradient-to-b from-red-600 via-rose-600 to-red-700 shadow-sm shadow-red-600/30 shrink-0" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight flex flex-wrap items-baseline gap-2.5 sm:gap-3">
                <span>{team?.titleNe || 'हाम्रो टिम'}</span>
                <span className="text-xl sm:text-2xl font-bold text-slate-400 dark:text-slate-500 font-sans">
                  ({team?.titleEn || 'Our Team'})
                </span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pt-1 leading-relaxed pl-5 sm:pl-6">
              {team?.subtitleNe || 'सबै छ डट कम (SabaiChha.com) को सम्पादकीय तथा सञ्चालक समूहको आधिकारिक विवरण'}
            </p>
          </div>

          <div className="self-start md:self-end shrink-0">
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 font-mono shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              {members.length} जना टिम सदस्यहरू
            </span>
          </div>
        </div>

        {/* Legal & Organization Info Box (Matching chautaripatrika.com format) */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Building className="w-4 h-4 text-red-600 shrink-0" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              संस्थागत तथा कानुनी विवरण (Legal & Media Details)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">सञ्चालक / संस्था</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm block">
                {siteInfo.portalName || 'SabaiChha.com'}
              </span>
              <span className="text-[11px] text-slate-500 block">डिजिटल अनलाइन पत्रिका</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">सूचना विभाग दर्ता नं.</span>
              <span className="font-bold text-red-600 dark:text-red-400 text-sm font-mono block">
                {siteInfo.deptOfInfoNo || '५३२७'}
              </span>
              <span className="text-[11px] text-slate-500 block">प्रेस काउन्सिल सूचीकरण</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">कार्यालय सम्पर्क</span>
              <a
                href={`tel:${siteInfo.phone || '9860207171'}`}
                className="font-bold text-slate-900 dark:text-white text-sm font-mono block hover:text-red-600"
              >
                {siteInfo.phone || '9860207171'}
              </a>
              <span className="text-[11px] text-slate-500 block">फोन तथा ह्वाट्सएप</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">इमेल / ठेगाना</span>
              <a
                href={`mailto:${siteInfo.email || 'info@sabaichha.com'}`}
                className="font-bold text-slate-900 dark:text-white text-xs font-mono block hover:text-red-600 truncate"
              >
                {siteInfo.email || 'info@sabaichha.com'}
              </a>
              <span className="text-[11px] text-slate-500 block truncate">
                {siteInfo.addressNe || 'काठमाडौँ, नेपाल'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Leadership Tier (सम्पादकीय नेतृत्व) */}
        {leadership.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-red-600" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
                <Award className="w-5 h-5 text-red-600" />
                <span>सम्पादकीय नेतृत्व (Editorial Leadership)</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {leadership.map((leader) => (
                <div
                  key={leader.id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-red-600/30 dark:border-red-600/40 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-600/10 to-transparent rounded-bl-full pointer-events-none" />

                  {/* Avatar */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shrink-0 border-4 border-red-600/20 shadow-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {leader.avatarUrl ? (
                      <Image
                        src={leader.avatarUrl}
                        alt={leader.nameNe}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-3xl">
                        <span>{leader.nameNe.slice(0, 1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Leader Info */}
                  <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-xs mb-1.5">
                        {leader.roleNe}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white leading-tight">
                        {leader.nameNe}
                      </h3>
                      {leader.nameEn && leader.nameEn !== leader.nameNe && (
                        <p className="text-xs sm:text-sm text-slate-500 font-sans font-semibold">
                          {leader.nameEn}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
                      सबै छ डट कम (SabaiChha.com) को मुख्य सम्पादकीय नीति, निष्पक्ष पत्रकारिता तथा सामग्रीको दिशानिर्देशन।
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-600 dark:text-slate-400">
                      {leader.phone && (
                        <a
                          href={`tel:${leader.phone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-red-600 transition font-mono font-medium"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{leader.phone}</span>
                        </a>
                      )}
                      {leader.email && (
                        <a
                          href={`mailto:${leader.email}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-red-600 transition font-mono font-medium"
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-500" />
                          <span>{leader.email}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 2: All Other Editorial & Department Members */}
        {others.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-slate-900 dark:bg-slate-100" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                सम्पादकीय, रिपोर्टिङ तथा प्राविधिक टोली
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {others.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group"
                >
                  {/* Photo / Avatar */}
                  <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3.5 border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {member.avatarUrl ? (
                      <Image
                        src={member.avatarUrl}
                        alt={member.nameNe}
                        fill
                        className="object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xl">
                        {member.nameNe.slice(0, 1)}
                      </div>
                    )}
                  </div>

                  {/* Name & Role */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition leading-snug">
                    {member.nameNe}
                  </h3>
                  {member.nameEn && member.nameEn !== member.nameNe && (
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      {member.nameEn}
                    </p>
                  )}

                  <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400 border border-slate-200 dark:border-slate-700">
                    {member.roleNe}
                  </span>

                  <span className="mt-1 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    {member.department}
                  </span>

                  {/* Contact Info */}
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 w-full flex items-center justify-center gap-3 text-xs text-slate-500">
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        title="Call"
                        className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        title="Email"
                        className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer categories={categories} />
    </div>
  )
}
