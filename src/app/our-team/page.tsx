import * as React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import { getSiteSettings } from '@/lib/settings'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

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

  // Group members into Leadership (Top Box) vs Team (Grid below) matching client sample
  const leadership = members.filter((m) => m.department === 'LEADERSHIP')
  const others = members.filter((m) => m.department !== 'LEADERSHIP')

  // If no leadership explicitly tagged, use the first 1-2 members as top leads
  const topLeaders = leadership.length > 0 ? leadership : members.slice(0, 1)
  const gridMembers = leadership.length > 0 ? others : members.slice(1)

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header categories={categories} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10 sm:space-y-14">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link href="/" className="hover:text-red-600 transition">
            गृहपृष्ठ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {team?.titleNe || 'हाम्रो टिम'}
          </span>
        </nav>

        {/* Clean Page Title */}
        <div className="text-center space-y-1 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {team?.titleNe || 'हाम्रो टिम'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-sans">
            {team?.titleEn || 'Our Team'}
          </p>
        </div>

        {/* 1. TOP FEATURED LEADER CARD (Matching sample top card with blue accent) */}
        {topLeaders.length > 0 && (
          <div
            className={`mx-auto ${
              topLeaders.length === 1
                ? 'max-w-md'
                : 'grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl'
            }`}
          >
            {topLeaders.map((leader) => (
              <div
                key={leader.id}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 border-t-4 border-t-blue-500 p-8 sm:p-10 flex flex-col items-center text-center transition hover:shadow-md"
              >
                {/* Circular Photo */}
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 shrink-0">
                  {leader.avatarUrl ? (
                    <img
                      src={leader.avatarUrl}
                      alt={leader.nameNe}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-3xl">
                      {leader.nameNe.slice(0, 1)}
                    </div>
                  )}
                </div>

                {/* Name */}
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-4 leading-tight">
                  {leader.nameNe}
                </h2>

                {/* Designation / Role */}
                {leader.roleNe && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                    {leader.roleNe}
                  </p>
                )}

                {/* Contact Phone */}
                {leader.phone && (
                  <a
                    href={`tel:${leader.phone}`}
                    className="text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-blue-600 transition mt-1.5 block"
                  >
                    {leader.phone}
                  </a>
                )}

                {/* Email */}
                {leader.email && (
                  <a
                    href={`mailto:${leader.email}`}
                    className="text-xs font-mono text-slate-400 hover:text-blue-600 transition mt-0.5 block"
                  >
                    {leader.email}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 2. TEAM MEMBERS GRID BELOW (3-column circular photo grid matching client sample) */}
        {gridMembers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-14 max-w-4xl mx-auto pt-4 sm:pt-6">
            {gridMembers.map((member) => (
              <div key={member.id} className="flex flex-col items-center text-center group">
                {/* Circular Photo */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 shrink-0">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.nameNe}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-2xl">
                      {member.nameNe.slice(0, 1)}
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-3.5 leading-snug">
                  {member.nameNe}
                </h3>

                {/* Designation / Role */}
                {member.roleNe && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                    {member.roleNe}
                  </p>
                )}

                {/* Contact Phone */}
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-blue-600 transition mt-1 block"
                  >
                    {member.phone.toLowerCase().startsWith('contact')
                      ? member.phone
                      : member.phone}
                  </a>
                )}

                {/* Email */}
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="text-xs font-mono text-slate-400 hover:text-blue-600 transition mt-0.5 block"
                  >
                    {member.email}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Minimal Legal Footer Strip */}
        <div className="pt-10 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 space-y-1">
          <p>
            सूचना विभाग दर्ता नं. <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{siteInfo.deptOfInfoNo || '५३२७'}</span> | {siteInfo.portalName || 'SabaiChha.com'}
          </p>
          <p className="text-[11px] text-slate-400">
            कार्यालय सम्पर्क: {siteInfo.phone || '9860207171'} | {siteInfo.email || 'info@sabaichha.com'}
          </p>
        </div>
      </main>

      <Footer categories={categories} />
    </div>
  )
}
