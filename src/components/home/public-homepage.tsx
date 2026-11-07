'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { BreakingTicker } from '@/components/home/breaking-ticker'
import { TrendingRibbon } from '@/components/home/trending-ribbon'
import { useLanguage } from '@/context/language-context'
import { TrendingTopicsSettings } from '@/lib/settings'
import { getLocalizedTitle, getLocalizedSubtitle, getLocalizedExcerpt } from '@/lib/data/translations'
import { AdBanner } from '@/components/ads/ad-banner'
import { NewsletterBox } from '@/components/newsletter/newsletter-box'
import { BookmarkButton } from '@/components/bookmarks/bookmark-button'
import { CategoryHeroSection } from '@/components/home/category-hero-section'
import { toNepaliNumerals } from '@/lib/market/market-service'
import {
  Clock,
  Flame,
  Star,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Eye,
  ListPlus,
  ArrowRight,
  Share2,
} from 'lucide-react'

interface ArticleSnippet {
  id: string
  title: string
  slug: string
  subtitle?: string | null
  excerpt?: string | null
  featuredImage?: string | null
  viewCount: number
  readTimeMinutes: number
  publishedAt: string | null | Date
  author?: { fullName: string; avatarUrl: string | null }
  category: { nameEn: string; nameNe: string; slug: string }
}

interface CategoryNav {
  id: number
  nameEn: string
  nameNe: string
  slug: string
}

interface CategorySectionData {
  id: number
  nameEn: string
  nameNe: string
  slug: string
  orderIndex: number
  layoutStyle?: string
  articles: ArticleSnippet[]
}

export function PublicHomepage({
  trendingTopics,
  categories,
  categorySections,
  breakingArticles,
  featuredArticles,
  featuredLead,
  topHighlights,
  trendingArticles,
}: {
  trendingTopics?: TrendingTopicsSettings
  categories: CategoryNav[]
  categorySections: CategorySectionData[]
  breakingArticles: {
    id: string
    title: string
    slug: string
    publishedAt?: Date | string | null
    category?: { nameEn: string; nameNe: string }
  }[]
  featuredArticles?: ArticleSnippet[]
  featuredLead: ArticleSnippet | null
  topHighlights: ArticleSnippet[]
  trendingArticles: ArticleSnippet[]
}) {
  const { language, t } = useLanguage()
  const [featuredIndex, setFeaturedIndex] = React.useState(0)
  const [isFeaturedPaused, setIsFeaturedPaused] = React.useState(false)

  // Consolidate featured stories list (multi-featured support)
  const allFeatured = React.useMemo(() => {
    if (featuredArticles && featuredArticles.length > 0) {
      return featuredArticles
    }
    return featuredLead ? [featuredLead] : []
  }, [featuredArticles, featuredLead])

  // Auto-rotate every 6.5 seconds if multiple featured stories exist and reader is not hovering
  React.useEffect(() => {
    if (allFeatured.length <= 1 || isFeaturedPaused) return
    const timer = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % allFeatured.length)
    }, 6500)
    return () => clearInterval(timer)
  }, [allFeatured.length, isFeaturedPaused])

  const currentFeatured = allFeatured[featuredIndex] || featuredLead

  // Format time ago helper
  const formatTimeAgo = (dateStr: string | null | Date) => {
    if (!dateStr) return ''
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    if (diff < 60) return `${diff} ${language === 'ne' ? 'मिनेट अगाडि' : 'm ago'}`
    const hours = Math.floor(diff / 60)
    if (hours < 24) return `${hours} ${language === 'ne' ? 'घण्टा अगाडि' : 'h ago'}`
    const days = Math.floor(hours / 24)
    return `${days} ${language === 'ne' ? 'दिन अगाडि' : 'd ago'}`
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* 1. Header with Red & White Theme */}
      <Header categories={categories} />

      {/* 2. Infinite Horizontal Trending Topics Ribbon */}
      <TrendingRibbon trendingTopics={trendingTopics} />

      {/* 3. Live Breaking Ticker */}
      <BreakingTicker breakingArticles={breakingArticles} />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-10 sm:space-y-12">
        {/* ========================================================= */}
        {/* HERO SECTION: Lead Story (प्रमुख समाचार) + Latest Highlights */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Lead Story (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-3">
            {/* Clear Section Title with Multi-Featured Rotating Controls */}
            <div className="flex items-center justify-between pb-2 border-b-2 border-red-600 gap-2 flex-nowrap">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
                <span className="p-1 rounded-md bg-amber-500 text-white shadow-2xs shrink-0">
                  <Star className="w-3.5 h-3.5 fill-white" />
                </span>
                <h2
                  className="text-sm sm:text-base md:text-lg font-black text-slate-950 dark:text-white uppercase tracking-wider shrink-0"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {language === 'ne' ? 'प्रमुख समाचार' : 'Featured Story'}
                </h2>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap">
                {allFeatured.length > 1 && (
                  <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-2 sm:px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shrink-0 select-none">
                    <span
                      className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 font-mono tracking-tight tabular-nums shrink-0"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {language === 'ne'
                        ? `${toNepaliNumerals(featuredIndex + 1)}\u00A0/\u00A0${toNepaliNumerals(allFeatured.length)}`
                        : `${featuredIndex + 1}\u00A0/\u00A0${allFeatured.length}`}
                    </span>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setFeaturedIndex((prev) => (prev - 1 + allFeatured.length) % allFeatured.length)}
                        className="w-5 h-5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer shrink-0"
                        aria-label="Previous featured story"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeaturedIndex((prev) => (prev + 1) % allFeatured.length)}
                        className="w-5 h-5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer shrink-0"
                        aria-label="Next featured story"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                <span
                  className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full shrink-0"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {language === 'ne' ? 'सम्पादकीय छनोट' : "Editor's Pick"}
                </span>
              </div>
            </div>

            {currentFeatured ? (
              <div
                onMouseEnter={() => setIsFeaturedPaused(true)}
                onMouseLeave={() => setIsFeaturedPaused(false)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition duration-300"
              >
                {/* Cover Image with Controlled Cinematic Height */}
                {currentFeatured.featuredImage && (
                  <Link
                    href={`/news/${currentFeatured.slug}`}
                    key={`img-${currentFeatured.id}`}
                    className="block relative w-full aspect-16/9 sm:aspect-16/8 max-h-[300px] sm:max-h-[340px] overflow-hidden group bg-slate-950"
                  >
                    <Image
                      src={currentFeatured.featuredImage}
                      alt={currentFeatured.title}
                      fill
                      priority
                      className="object-cover group-hover:scale-102 transition duration-500 animate-in fade-in duration-300"
                    />

                    {/* Badge Overlay */}
                    <div className="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-3.5 z-10 flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-extrabold bg-amber-500 text-white flex items-center gap-1 shadow-md uppercase tracking-wider">
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
                        <span>{language === 'ne' ? 'प्रमुख समाचार' : 'Featured'}</span>
                      </span>

                      <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-bold bg-slate-900/85 text-white border border-white/20 backdrop-blur-md uppercase tracking-wide">
                        {language === 'ne' ? currentFeatured.category.nameNe : currentFeatured.category.nameEn}
                      </span>

                      <span className="hidden sm:inline-flex px-2.5 py-1 rounded-md text-xs font-bold bg-black/60 text-white backdrop-blur-sm items-center gap-1">
                        <Clock className="w-3 h-3 text-red-400" />
                        <span>{language === 'ne' ? toNepaliNumerals(currentFeatured.readTimeMinutes) : currentFeatured.readTimeMinutes} {t('readTime')}</span>
                      </span>
                    </div>
                  </Link>
                )}

                <div key={`body-${currentFeatured.id}`} className="p-4 sm:p-6 md:p-8 space-y-3.5 sm:space-y-4 animate-in fade-in duration-300">
                  {/* Headline */}
                  <Link href={`/news/${currentFeatured.slug}`} className="group block">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition leading-tight tracking-tight">
                      {getLocalizedTitle(currentFeatured, language)}
                    </h2>
                  </Link>

                  {/* Subtitle */}
                  {currentFeatured.subtitle && (
                    <p className="text-xs sm:text-sm md:text-base font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                      {getLocalizedSubtitle(currentFeatured, language)}
                    </p>
                  )}

                  {/* Key Takeaways Box (TL;DR Summary from Blueprint) */}
                  {currentFeatured.excerpt && (
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border-l-4 border-red-600 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                      <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400 mb-1.5 uppercase text-[11px] tracking-wider">
                        <ListPlus className="w-3.5 h-3.5" />
                        <span>{language === 'ne' ? 'मुख्य बुँदाहरू' : 'Key Takeaways'}</span>
                      </div>
                      {getLocalizedExcerpt(currentFeatured, language)}
                    </div>
                  )}

                  {/* Author Byline & Publish Time */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {currentFeatured.author?.fullName || 'SabaiChha Desk'}
                      </span>
                      <span>•</span>
                      <span suppressHydrationWarning>{formatTimeAgo(currentFeatured.publishedAt)}</span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <BookmarkButton
                        size="sm"
                        article={{
                          id: currentFeatured.id,
                          title: currentFeatured.title,
                          slug: currentFeatured.slug,
                          featuredImage: currentFeatured.featuredImage,
                          categoryName: language === 'ne' ? currentFeatured.category.nameNe : currentFeatured.category.nameEn,
                        }}
                      />
                      <Link
                        href={`/news/${currentFeatured.slug}`}
                        className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 hover:underline"
                      >
                        <span>{language === 'ne' ? 'पूरा पढ्नुहोस्' : 'Read Full Story'}</span>
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Slide Indicators for multiple featured stories */}
                  {allFeatured.length > 1 && (
                    <div className="flex items-center justify-center gap-1.5 pt-2">
                      {allFeatured.map((_: ArticleSnippet, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFeaturedIndex(idx)}
                          aria-label={`Go to featured story ${idx + 1}`}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            idx === featuredIndex
                              ? 'w-6 bg-red-600 dark:bg-red-500'
                              : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
                {language === 'ne' ? 'कुनै प्रमुख समाचार प्रकाशित गरिएको छैन।' : 'No featured lead story currently published.'}
              </div>
            )}
          </div>

          {/* Top Highlights Sidebar (Right 4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-red-600 gap-2 flex-nowrap">
              <h3
                className="text-sm sm:text-base md:text-lg font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 shrink-0"
                style={{ whiteSpace: 'nowrap' }}
              >
                <Flame className="w-4 h-4 text-red-600 shrink-0" />
                <span>{language === 'ne' ? 'पछिल्लो अपडेट' : 'Latest Updates'}</span>
              </h3>
              <span
                className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-2 py-0.5 rounded-full shrink-0"
                style={{ whiteSpace: 'nowrap' }}
              >
                {language === 'ne' ? 'अपडेट' : 'Recent'}
              </span>
            </div>

            <div className="space-y-3">
              {topHighlights.map((story, index) => (
                <div
                  key={story.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-500/40 shadow-2xs hover:shadow-xs transition flex gap-3 group"
                >
                  {/* Number Badge */}
                  <span className="text-2xl font-black text-red-600/30 group-hover:text-red-600 transition font-mono shrink-0">
                    0{index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                      {language === 'ne' ? story.category.nameNe : story.category.nameEn}
                    </span>
                    <Link
                      href={`/news/${story.slug}`}
                      className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-2 leading-snug mt-0.5"
                    >
                      {getLocalizedTitle(story, language)}
                    </Link>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {formatTimeAgo(story.publishedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Phase 6: Homepage Billboard Ad Slot (970x250) */}
        <AdBanner placement="HOMEPAGE_BILLBOARD" />

        {/* ========================================================= */}
        {/* ALL CATEGORIES IN EXACT ADMIN-CONFIGURED ORDER (orderIndex) */}
        {/* ========================================================= */}
        {categorySections.map((cat, index) => (
          <React.Fragment key={cat.id}>
            <CategoryHeroSection
              category={{
                nameEn: cat.nameEn,
                nameNe: cat.nameNe,
                slug: cat.slug,
                layoutStyle: cat.layoutStyle,
              }}
              articles={cat.articles}
            />

            {/* Insert Most Read / Trending + Sidebar Ad after the 3rd category (or after the last if fewer than 3) */}
            {index === Math.min(2, categorySections.length - 1) && trendingArticles.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b-2 border-red-600">
                  <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-red-600" />
                    <span>{language === 'ne' ? 'धेरै पढिएको' : 'Most Read / Trending'}</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-2xs">
                    {trendingArticles.map((story, i) => (
                      <div key={story.id} className="flex items-start gap-3 group p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <span className="text-xl font-mono font-black text-red-600 shrink-0">
                          {language === 'ne' ? toNepaliNumerals(i + 1) : i + 1}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/news/${story.slug}`}
                            className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-2 leading-snug"
                          >
                            {getLocalizedTitle(story, language)}
                          </Link>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-red-500" />
                              <span>
                                {language === 'ne'
                                  ? `${toNepaliNumerals(story.viewCount)} पटक पढिएको`
                                  : `${story.viewCount.toLocaleString()} views`}
                              </span>
                            </span>
                            <span>{formatTimeAgo(story.publishedAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-4">
                    <AdBanner placement="SIDEBAR_RECTANGLE" />
                  </div>
                </div>
              </section>
            )}

            {/* Insert Newsletter Box after the 4th category (or after the last if fewer than 4) */}
            {index === Math.min(3, categorySections.length - 1) && <NewsletterBox />}
          </React.Fragment>
        ))}
      </main>

      {/* Phase 6: Sticky Bottom Floating Ad Banner */}
      <AdBanner placement="STICKY_FOOTER" />

      {/* ========================================================= */}
      {/* DYNAMIC FOOTER (Times of India style & Legal Details) */}
      <Footer categories={categories} />
    </div>
  )
}
