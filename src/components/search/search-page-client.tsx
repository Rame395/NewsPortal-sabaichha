'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/language-context'
import { toNepaliNumerals } from '@/lib/utils/numerals'
import {
  Search,
  X,
  Clock,
  Flame,
  ArrowUpDown,
  TrendingUp,
  Tag,
  Newspaper,
  BookOpen,
  Filter,
} from 'lucide-react'

interface ArticleItem {
  id: string
  title: string
  slug: string
  subtitle?: string | null
  excerpt?: string | null
  featuredImage?: string | null
  publishedAt: string | null | Date
  readTimeMinutes?: number
  viewCount?: number
  category: {
    id: number
    nameEn: string
    nameNe: string
    slug: string
  }
  author: {
    fullName: string
  }
}

interface CategoryFilterItem {
  id: number
  nameEn: string
  nameNe: string
  slug: string
  count: number
}

interface SearchPageClientProps {
  initialQuery: string
  initialCategory: string
  initialSort: string
  articles: ArticleItem[]
  categories: CategoryFilterItem[]
  totalCount: number
}

const TRENDING_KEYWORDS = {
  ne: ['राजनीति', 'अर्थतन्त्र', 'नेपाल क्रिकेट', 'सुनको भाउ', 'मौसम', 'प्रतिनिधिसभा', 'शिक्षा', 'पर्यटन'],
  en: ['Politics', 'Economy', 'Nepal Cricket', 'Gold Rate', 'Weather', 'Parliament', 'Education', 'Tourism'],
}

// Function to highlight matched search terms in text
function HighlightText({ text, query }: { text?: string | null; query: string }) {
  if (!text) return null
  if (!query.trim()) return <>{text}</>

  const tokens = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

  if (tokens.length === 0) return <>{text}</>

  const regex = new RegExp(`(${tokens.join('|')})`, 'gi')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-yellow-200 dark:bg-yellow-900/60 text-slate-950 dark:text-yellow-200 rounded-xs px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

export function SearchPageClient({
  initialQuery,
  initialCategory,
  initialSort,
  articles,
  categories,
  totalCount,
}: SearchPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const isNe = language === 'ne'

  const [inputVal, setInputVal] = React.useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = React.useState(initialCategory)
  const [selectedSort, setSelectedSort] = React.useState(initialSort)

  // Keep input in sync with URL
  React.useEffect(() => {
    setInputVal(initialQuery)
    setSelectedCategory(initialCategory)
    setSelectedSort(initialSort)
  }, [initialQuery, initialCategory, initialSort])

  const pushSearch = (q: string, cat: string, s: string) => {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (cat) params.set('category', cat)
    if (s && s !== 'latest') params.set('sort', s)
    router.push(`/search?${params.toString()}`)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    pushSearch(inputVal, selectedCategory, selectedSort)
  }

  const handleCategoryChange = (slug: string) => {
    const nextCat = selectedCategory === slug ? '' : slug
    setSelectedCategory(nextCat)
    pushSearch(inputVal, nextCat, selectedSort)
  }

  const handleSortChange = (newSort: string) => {
    setSelectedSort(newSort)
    pushSearch(inputVal, selectedCategory, newSort)
  }

  const handleQuickKeywordClick = (word: string) => {
    setInputVal(word)
    setSelectedCategory('')
    pushSearch(word, '', selectedSort)
  }

  const trendingList = isNe ? TRENDING_KEYWORDS.ne : TRENDING_KEYWORDS.en

  return (
    <div className="space-y-6">
      {/* 1. In-Page Interactive Search Refinement Masthead */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            <span>{isNe ? 'समाचार खोजी इन्जिन' : 'News Search Engine'}</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white mt-1">
            {initialQuery
              ? isNe
                ? `"${initialQuery}" सम्बन्धी खोजी परिणाम`
                : `Search results for "${initialQuery}"`
              : isNe
              ? 'सबै समाचारहरू खोज्नुहोस्'
              : 'Search News Articles'}
          </h1>
        </div>

        {/* Search Refinement Form */}
        <form onSubmit={handleFormSubmit} className="relative w-full">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={isNe ? 'कुनै पनि समाचार वा विधाको नाम टाइप गर्नुहोस्...' : 'Type search terms, topics, or names...'}
              className="w-full pl-12 pr-28 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600 transition"
            />
            {inputVal && (
              <button
                type="button"
                onClick={() => setInputVal('')}
                className="absolute right-20 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs"
            >
              {isNe ? 'खोज्नुहोस्' : 'Search'}
            </button>
          </div>
        </form>

        {/* Quick Trending Hashtags */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-red-600" />
            <span>{isNe ? 'चर्चामा:' : 'Trending:'}</span>
          </span>
          {trendingList.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleQuickKeywordClick(tag)}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-medium transition cursor-pointer text-[11px]"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Filter & Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        {/* Category Facet Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => handleCategoryChange('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
              !selectedCategory
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
            }`}
          >
            {isNe ? 'सबै' : 'All'} ({isNe ? toNepaliNumerals(totalCount) : totalCount})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                selectedCategory === cat.slug
                  ? 'bg-red-600 text-white border-red-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
              }`}
            >
              {isNe ? cat.nameNe : cat.nameEn} ({isNe ? toNepaliNumerals(cat.count) : cat.count})
            </button>
          ))}
        </div>

        {/* Sort Switcher */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => handleSortChange('latest')}
            className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1 ${
              selectedSort !== 'popular'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{isNe ? 'ताजा' : 'Latest'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSortChange('popular')}
            className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1 ${
              selectedSort === 'popular'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-500" />
            <span>{isNe ? 'सर्वाधिक पढिएका' : 'Most Read'}</span>
          </button>
        </div>
      </div>

      {/* 3. Search Results List or Empty State */}
      {!initialQuery && articles.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {isNe ? 'समाचार खोजी सुरु गर्नुहोस्' : 'Start your search'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isNe
              ? 'माथिको सर्च बक्समा शीर्षक, विधा वा लेखकको नाम टाइप गरी ताजा र पुराना समाचारहरू पत्ता लगाउनुहोस्।'
              : 'Type keywords, topics, or author names in the search box above to find stories.'}
          </p>
        </div>
      ) : articles.length === 0 ? (
        <div className="p-14 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isNe
                ? `"${initialQuery}" का लागि कुनै समाचार फेला परेन`
                : `No results found for "${initialQuery}"`}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {isNe
                ? 'हिज्जे जाँच गर्नुहोस् वा अन्य प्रचलित विषयहरूबाट खोजी गर्नुहोस्।'
                : 'Please check your spelling or try different search terms.'}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-2">
            {trendingList.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleQuickKeywordClick(tag)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((art) => (
            <div
              key={art.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-500/50 transition shadow-2xs hover:shadow-xs flex flex-col sm:flex-row gap-5 group"
            >
              {art.featuredImage ? (
                <Link
                  href={`/news/${art.slug}`}
                  className="relative aspect-16/10 w-full sm:w-52 rounded-xl overflow-hidden shrink-0 bg-slate-950"
                >
                  <Image
                    src={art.featuredImage}
                    alt={art.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </Link>
              ) : (
                <Link
                  href={`/news/${art.slug}`}
                  className="w-full sm:w-52 aspect-16/10 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center group-hover:bg-slate-200 transition"
                >
                  <Newspaper className="w-8 h-8 text-slate-400" />
                </Link>
              )}

              <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                      {isNe ? art.category.nameNe : art.category.nameEn}
                    </span>
                    {art.readTimeMinutes && (
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        • <Clock className="w-3 h-3" />
                        {isNe
                          ? `${toNepaliNumerals(art.readTimeMinutes)} मिनेट पढ्न`
                          : `${art.readTimeMinutes} min read`}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/news/${art.slug}`}
                    className="block text-base sm:text-lg font-bold text-slate-950 dark:text-white group-hover:text-red-600 transition leading-snug"
                  >
                    <HighlightText text={art.title} query={initialQuery} />
                  </Link>

                  {(art.subtitle || art.excerpt) && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                      <HighlightText
                        text={art.subtitle || art.excerpt}
                        query={initialQuery}
                      />
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {art.author.fullName}
                  </span>
                  <span>•</span>
                  <span suppressHydrationWarning>
                    {new Date(art.publishedAt || Date.now()).toLocaleDateString()}
                  </span>
                  {typeof art.viewCount === 'number' && art.viewCount > 0 && (
                    <>
                      <span>•</span>
                      <span className="font-mono">
                        {isNe ? `${toNepaliNumerals(art.viewCount)} पटक पढिएको` : `${art.viewCount} views`}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
