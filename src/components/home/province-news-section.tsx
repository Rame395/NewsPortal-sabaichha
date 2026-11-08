'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, ChevronRight, Clock, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/context/language-context'
import { toNepaliNumerals } from '@/lib/market/market-service'
import { CategoryStorySnippet } from '@/components/home/category-hero-section'

const PROVINCES = [
  { id: 'koshi', nameNe: 'कोशी', nameEn: 'Koshi', keyword: 'कोशी' },
  { id: 'madhesh', nameNe: 'मधेश', nameEn: 'Madhesh', keyword: 'मधेश' },
  { id: 'bagmati', nameNe: 'बागमती', nameEn: 'Bagmati', keyword: 'बागमती' },
  { id: 'gandaki', nameNe: 'गण्डकी', nameEn: 'Gandaki', keyword: 'गण्डकी' },
  { id: 'lumbini', nameNe: 'लुम्बिनी', nameEn: 'Lumbini', keyword: 'लुम्बिनी' },
  { id: 'karnali', nameNe: 'कर्णाली', nameEn: 'Karnali', keyword: 'कर्णाली' },
  { id: 'sudurpashchim', nameNe: 'सुदूरपश्चिम', nameEn: 'Sudurpashchim', keyword: 'सुदूरपश्चिम' },
]

interface ProvinceNewsSectionProps {
  articles: CategoryStorySnippet[]
  className?: string
}

export function ProvinceNewsSection({ articles = [], className = '' }: ProvinceNewsSectionProps) {
  const { language } = useLanguage()
  const [selectedProvince, setSelectedProvince] = React.useState(PROVINCES[2]) // Default to Bagmati

  // Filter articles that mention the selected province keyword in title, excerpt, or tags
  const filteredArticles = React.useMemo(() => {
    if (!articles || articles.length === 0) return []
    const kw = selectedProvince.keyword.toLowerCase()
    const matches = articles.filter((art) => {
      const inTitle = art.title.toLowerCase().includes(kw)
      const inExcerpt = art.excerpt?.toLowerCase().includes(kw) || false
      const inSubtitle = art.subtitle?.toLowerCase().includes(kw) || false
      return inTitle || inExcerpt || inSubtitle
    })

    // If matches are found, return them; otherwise fallback to recent articles so the section always looks rich
    return matches.length > 0 ? matches : articles.slice(0, 4)
  }, [articles, selectedProvince])

  const leadStory = filteredArticles[0]
  const subStories = filteredArticles.slice(1, 4)

  const formatTimeAgo = (dateStr: string | null | Date) => {
    if (!dateStr) return ''
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    if (diff < 1) return language === 'ne' ? 'भर्खरै' : 'Just now'
    if (diff < 60) {
      const num = language === 'ne' ? toNepaliNumerals(diff) : diff
      return `${num} ${language === 'ne' ? 'मिनेट अगाडि' : 'm ago'}`
    }
    const hours = Math.floor(diff / 60)
    if (hours < 24) {
      const num = language === 'ne' ? toNepaliNumerals(hours) : hours
      return `${num} ${language === 'ne' ? 'घण्टा अगाडि' : 'h ago'}`
    }
    const days = Math.floor(hours / 24)
    const num = language === 'ne' ? toNepaliNumerals(days) : days
    return `${num} ${language === 'ne' ? 'दिन अगाडि' : 'd ago'}`
  }

  return (
    <section className={`space-y-4 sm:space-y-5 ${className}`}>
      {/* Header with Title & Province Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b-2 border-red-600 gap-3">
        {/* Section Title */}
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-red-600 text-white shadow-2xs">
            <MapPin className="w-4 h-4" />
          </span>
          <h3 className="text-base sm:text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight">
            {language === 'ne' ? 'प्रदेश समाचार' : 'Province News'}
          </h3>
        </div>

        {/* 7 Province Tab Pills */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0 touch-pan-x">
          {PROVINCES.map((prov) => {
            const isActive = selectedProvince.id === prov.id
            return (
              <button
                key={prov.id}
                type="button"
                onClick={() => setSelectedProvince(prov)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer select-none ${
                  isActive
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {language === 'ne' ? `${prov.nameNe} प्रदेश` : `${prov.nameEn} Province`}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content Grid: 1 Big Lead on Left + 3 Side Cards on Right */}
      {!leadStory ? (
        <div className="p-8 text-center bg-slate-100 dark:bg-slate-900 rounded-2xl text-slate-400 text-xs">
          {language === 'ne' ? 'यस प्रदेशमा हाल कुनै समाचार छैन।' : 'No news in this province yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Lead Story (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between group">
            {leadStory.featuredImage && (
              <Link href={`/news/${leadStory.slug}`} className="relative aspect-16/10 w-full overflow-hidden block">
                <Image
                  src={leadStory.featuredImage}
                  alt={leadStory.title}
                  fill
                  className="object-cover group-hover:scale-103 transition duration-500"
                />
                <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                  {language === 'ne' ? `${selectedProvince.nameNe} विशेष` : `${selectedProvince.nameEn} Special`}
                </span>
              </Link>
            )}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <Link
                  href={`/news/${leadStory.slug}`}
                  className="text-lg sm:text-xl font-black text-slate-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition leading-snug line-clamp-2"
                >
                  {leadStory.title}
                </Link>
                {leadStory.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {leadStory.subtitle}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  <span>{formatTimeAgo(leadStory.publishedAt)}</span>
                </span>
                <Link
                  href={`/search?q=${encodeURIComponent(selectedProvince.keyword)}`}
                  className="text-red-600 dark:text-red-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>{language === 'ne' ? 'थप समाचार' : 'More'}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* 3 Secondary Stories (Right 5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3">
            {subStories.map((story) => (
              <Link
                key={story.id}
                href={`/news/${story.slug}`}
                className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-red-400 dark:hover:border-red-600 hover:shadow-xs transition flex gap-3.5 items-center group"
              >
                {story.featuredImage ? (
                  <div className="relative w-24 h-20 sm:w-28 sm:h-22 rounded-xl overflow-hidden shrink-0">
                    <Image
                      src={story.featuredImage}
                      alt={story.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-20 sm:w-28 sm:h-22 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <MapPin className="w-6 h-6 opacity-30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">
                    {language === 'ne' ? selectedProvince.nameNe : selectedProvince.nameEn}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-2 leading-snug mt-0.5">
                    {story.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {formatTimeAgo(story.publishedAt)}
                  </span>
                </div>
              </Link>
            ))}

            {/* View Full Province Archive Button */}
            <Link
              href={`/search?q=${encodeURIComponent(selectedProvince.keyword)}`}
              className="py-2.5 text-center rounded-xl border border-dashed border-red-300 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold text-xs hover:bg-red-600 hover:text-white transition flex items-center justify-center gap-1.5"
            >
              <span>{language === 'ne' ? `${selectedProvince.nameNe} प्रदेशका सबै समाचारहरू` : `All ${selectedProvince.nameEn} Province News`}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
