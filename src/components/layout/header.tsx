'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/language-context'
import { TopUtilityBar } from '@/components/layout/top-utility-bar'
import { Search, ChevronRight } from 'lucide-react'

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
  const router = useRouter()
  const { language, t } = useLanguage()

  const [searchQuery, setSearchQuery] = React.useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
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
    <header className="w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* 1. Times of India Style Top Utility Bar (Live Weather, Market Rates & Circular Social Icons) */}
      <TopUtilityBar />

      {/* 2. Main Branding Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & Tagline */}
        <Link href="/" className="flex items-center gap-4 group shrink-0">
          <div className="relative h-14 w-60 sm:h-16 sm:w-72 bg-white rounded-lg p-1 shrink-0 flex items-center">
            <Image
              src="/logo.jpg"
              alt="SabaiChha.com - सबै छ डट कम"
              width={288}
              height={64}
              className="object-contain max-h-14 sm:max-h-16 w-auto"
              priority
            />
          </div>
          <div className="hidden lg:block border-l-2 border-red-600 pl-4">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
              {language === 'ne'
                ? 'नेपालको आधिकारिक डिजिटल अनलाइन पत्रिका'
                : 'Nepal’s Leading Digital News Portal'}
            </p>
            <p className="text-[11px] text-red-600 dark:text-red-400 font-mono font-semibold">
              https://sabaichha.com
            </p>
          </div>
        </Link>

        {/* Global Search Input */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </form>
      </div>

      {/* 3. Primary Red & White Category Navigation Bar */}
      <nav className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-x-auto scrollbar-none shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="px-3.5 py-3 text-sm font-extrabold text-red-600 dark:text-red-400 border-b-2 border-red-600 whitespace-nowrap transition"
          >
            {t('home')}
          </Link>

          {navCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="px-3.5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-b-2 hover:border-red-600 transition whitespace-nowrap"
            >
              {language === 'ne' ? cat.nameNe : cat.nameEn}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
