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
import { MultimediaShowcase } from '@/components/home/multimedia-showcase'
import { toNepaliNumerals } from '@/lib/market/market-service'
import {
  Clock,
  Flame,
  Star,
  ChevronRight,
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

// Feature toggles: Keep features preserved in codebase for future projects while controlling visibility
const SHOW_TRENDING_RIBBON = false // Trending Hashtags Ribbon (चर्चामा: #...)
const SHOW_BREAKING_TICKER = false // Top Red Live Breaking News Ticker (ताजा खबर)

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

  // Consolidate featured stories list (multi-featured support - all displayed stacked)
  const allFeatured = React.useMemo(() => {
    if (featuredArticles && featuredArticles.length > 0) {
      return featuredArticles
    }
    return featuredLead ? [featuredLead] : []
  }, [featuredArticles, featuredLead])

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

  // Pool of all published articles for province filtering and multimedia showcase
  const allArticlesPool = React.useMemo(() => {
    const pool = [
      ...(featuredArticles || []),
      ...(topHighlights || []),
      ...(trendingArticles || []),
      ...categorySections.flatMap((c) => c.articles || []),
    ]
    const seen = new Set<string>()
    return pool.filter((art) => {
      if (!art || !art.id || seen.has(art.id)) return false
      seen.add(art.id)
      return true
    })
  }, [featuredArticles, topHighlights, trendingArticles, categorySections])

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* 1. Header with Red & White Theme */}
      <Header categories={categories} />

      {/* 2. Infinite Horizontal Trending Topics Ribbon (Preserved in codebase, hidden for minimal UI) */}
      {SHOW_TRENDING_RIBBON && <TrendingRibbon trendingTopics={trendingTopics} />}

      {/* 3. Live Breaking Ticker (Preserved in codebase, hidden for minimal UI) */}
      {SHOW_BREAKING_TICKER && <BreakingTicker breakingArticles={breakingArticles} />}

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-10 sm:space-y-12">
        {/* ========================================================= */}
        {/* HERO SECTION: Lead Story (प्रमुख समाचार) + Latest Highlights */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Lead Stories (Left 8 Cols) - Stacked vertically below one another */}
          <div className="lg:col-span-8 space-y-4">
            {/* Clear Section Title */}
            <div className="flex items-center justify-between pb-2 border-b-2 border-red-600 gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="p-1 rounded-md bg-amber-500 text-white shadow-2xs shrink-0">
                  <Star className="w-3.5 h-3.5 fill-white" />
                </span>
                <h2
                  className="text-sm sm:text-base md:text-lg font-black text-slate-950 dark:text-white uppercase tracking-wider"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {language === 'ne' ? 'प्रमुख समाचार' : 'Featured Stories'}
                </h2>
              </div>

              {allFeatured.length > 1 && (
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                  {language === 'ne'
                    ? `${toNepaliNumerals(allFeatured.length)} प्रमुख समाचार`
                    : `${allFeatured.length} Stories`}
                </span>
              )}
            </div>

            {/* Stacked Featured Stories List */}
            {allFeatured.length > 0 ? (
              <div className="space-y-6 sm:space-y-8">
                {allFeatured.map((story, idx) => (
                  <article
                    key={story.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition duration-300"
                  >
                    {/* 1. TOP ZONE: Badges, Big Eye-Catching Headline & Subtitle ABOVE Image */}
                    <div className="p-4 sm:p-6 md:p-8 pb-3 sm:pb-4 space-y-2.5 sm:space-y-3.5">
                      {/* Category & Story Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-extrabold bg-[#C10A1E] text-white flex items-center gap-1 shadow-xs uppercase tracking-wider">
                          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
                          <span>{language === 'ne' ? 'प्रमुख समाचार' : 'Featured'}</span>
                        </span>

                        {story.category && (
                          <Link
                            href={`/category/${story.category.slug}`}
                            className="px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-bold bg-[#02267C] text-white uppercase tracking-wide hover:opacity-90 transition"
                          >
                            {language === 'ne' ? story.category.nameNe : story.category.nameEn}
                          </Link>
                        )}

                        <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-red-500" />
                          <span>
                            {language === 'ne' ? toNepaliNumerals(story.readTimeMinutes) : story.readTimeMinutes} {t('readTime')}
                          </span>
                        </span>
                      </div>

                      {/* Primary Eye-Catching Headline */}
                      <Link href={`/news/${story.slug}`} className="group block">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-black text-slate-950 dark:text-white group-hover:text-[#C10A1E] dark:group-hover:text-red-400 transition leading-tight tracking-tight">
                          {getLocalizedTitle(story, language)}
                        </h2>
                      </Link>

                      {/* Subtitle / Teaser */}
                      {story.subtitle && (
                        <p className="text-sm sm:text-base md:text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                          {getLocalizedSubtitle(story, language)}
                        </p>
                      )}
                    </div>

                    {/* 2. COVER IMAGE: Large Dramatic Story Photo */}
                    {story.featuredImage && (
                      <Link
                        href={`/news/${story.slug}`}
                        className="block relative w-full aspect-16/9 sm:aspect-16/8 max-h-[380px] sm:max-h-[440px] overflow-hidden group bg-slate-950"
                      >
                        <Image
                          src={story.featuredImage}
                          alt={story.title}
                          fill
                          priority={idx === 0}
                          className="object-cover group-hover:scale-102 transition duration-500"
                        />
                      </Link>
                    )}

                    {/* 3. BOTTOM ZONE: Key Takeaways & Author Byline */}
                    <div className="p-4 sm:p-6 md:p-8 pt-4 sm:pt-5 space-y-3.5 sm:space-y-4">
                      {/* Key Takeaways Box */}
                      {story.excerpt && (
                        <div className="p-3.5 sm:p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border-l-4 border-[#C10A1E] text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                          <div className="flex items-center gap-1.5 font-bold text-[#C10A1E] dark:text-red-400 mb-1.5 uppercase text-[11px] tracking-wider">
                            <ListPlus className="w-3.5 h-3.5" />
                            <span>{language === 'ne' ? 'मुख्य बुँदाहरू' : 'Key Takeaways'}</span>
                          </div>
                          {getLocalizedExcerpt(story, language)}
                        </div>
                      )}

                      {/* Author Byline & Publish Time */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {story.author?.fullName || 'SabaiChha Desk'}
                          </span>
                          <span>•</span>
                          <span suppressHydrationWarning>{formatTimeAgo(story.publishedAt)}</span>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <BookmarkButton
                            size="sm"
                            article={{
                              id: story.id,
                              title: story.title,
                              slug: story.slug,
                              featuredImage: story.featuredImage,
                              categoryName: language === 'ne' ? story.category.nameNe : story.category.nameEn,
                            }}
                          />
                          <Link
                            href={`/news/${story.slug}`}
                            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 hover:underline"
                          >
                            <span>{language === 'ne' ? 'पूरा पढ्नुहोस्' : 'Read Full Story'}</span>
                            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
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
        {/* Automatically hides any category with 0 published articles */}
        {/* ========================================================= */}
        {categorySections
          .filter((cat) => cat.articles && cat.articles.length > 0)
          .map((cat, index, activeCategories) => (
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
            {index === Math.min(2, activeCategories.length - 1) && trendingArticles.length > 0 && (
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

        {/* Multimedia Showcase: Photo Feature & Video Reports (मल्टिमिडिया) */}
        <MultimediaShowcase articles={allArticlesPool} />
      </main>

      {/* Phase 6: Sticky Bottom Floating Ad Banner */}
      <AdBanner placement="STICKY_FOOTER" />

      {/* ========================================================= */}
      {/* DYNAMIC FOOTER (Times of India style & Legal Details) */}
      <Footer categories={categories} />
    </div>
  )
}
