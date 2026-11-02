'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { BreakingTicker } from '@/components/home/breaking-ticker'
import { useLanguage } from '@/context/language-context'
import { getLocalizedTitle, getLocalizedSubtitle, getLocalizedExcerpt } from '@/lib/data/translations'
import { AdBanner } from '@/components/ads/ad-banner'
import { NewsletterBox } from '@/components/newsletter/newsletter-box'
import { BookmarkButton } from '@/components/bookmarks/bookmark-button'
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

export function PublicHomepage({
  categories,
  breakingArticles,
  featuredLead,
  topHighlights,
  trendingArticles,
  politicsArticles,
  economyArticles,
  sportsArticles,
}: {
  categories: CategoryNav[]
  breakingArticles: { id: string; title: string; slug: string }[]
  featuredLead: ArticleSnippet | null
  topHighlights: ArticleSnippet[]
  trendingArticles: ArticleSnippet[]
  politicsArticles: ArticleSnippet[]
  economyArticles: ArticleSnippet[]
  sportsArticles: ArticleSnippet[]
}) {
  const { language, t } = useLanguage()

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

      {/* 2. Live Breaking Ticker */}
      <BreakingTicker breakingArticles={breakingArticles} />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-10 sm:space-y-12">
        {/* ========================================================= */}
        {/* HERO SECTION: Lead Story (मुख्य समाचार) + Top Highlights */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Lead Story (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {featuredLead ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition">
                {/* Cover Image */}
                {featuredLead.featuredImage && (
                  <Link href={`/news/${featuredLead.slug}`} className="block relative aspect-16/9 w-full overflow-hidden group">
                    <Image
                      src={featuredLead.featuredImage}
                      alt={featuredLead.title}
                      fill
                      priority
                      className="object-cover group-hover:scale-102 transition duration-500"
                    />
                    {/* Category Overlay Tag */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white uppercase tracking-wider shadow-md">
                        {language === 'ne' ? featuredLead.category.nameNe : featuredLead.category.nameEn}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-sm flex items-center gap-1">
                        <Clock className="w-3 h-3 text-red-400" />
                        <span>{featuredLead.readTimeMinutes} {t('readTime')}</span>
                      </span>
                    </div>
                  </Link>
                )}

                <div className="p-6 sm:p-8 space-y-4">
                  {/* Headline */}
                  <Link href={`/news/${featuredLead.slug}`} className="group block">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition leading-tight tracking-tight">
                      {getLocalizedTitle(featuredLead, language)}
                    </h2>
                  </Link>

                  {/* Subtitle */}
                  {featuredLead.subtitle && (
                    <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                      {getLocalizedSubtitle(featuredLead, language)}
                    </p>
                  )}

                  {/* Key Takeaways Box (TL;DR Summary from Blueprint) */}
                  {featuredLead.excerpt && (
                    <div className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border-l-4 border-red-600 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                      <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400 mb-1.5 uppercase text-[11px] tracking-wider">
                        <ListPlus className="w-3.5 h-3.5" />
                        <span>{language === 'ne' ? 'मुख्य बुँदाहरू' : 'Key Takeaways'}</span>
                      </div>
                      {getLocalizedExcerpt(featuredLead, language)}
                    </div>
                  )}

                  {/* Author Byline & Publish Time */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {featuredLead.author?.fullName || 'SabaiChha Desk'}
                      </span>
                      <span>•</span>
                      <span>{formatTimeAgo(featuredLead.publishedAt)}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <BookmarkButton
                        article={{
                          id: featuredLead.id,
                          title: featuredLead.title,
                          slug: featuredLead.slug,
                          featuredImage: featuredLead.featuredImage,
                          categoryName: language === 'ne' ? featuredLead.category.nameNe : featuredLead.category.nameEn,
                        }}
                      />
                      <Link
                        href={`/news/${featuredLead.slug}`}
                        className="inline-flex items-center gap-1 font-bold text-red-600 dark:text-red-400 hover:underline"
                      >
                        <span>{language === 'ne' ? 'पूरा पढ्नुहोस्' : 'Read Full Story'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
                {language === 'ne' ? 'कुनै प्रमुख समाचार प्रकाशित गरिएको छैन।' : 'No featured lead story currently published.'}
              </div>
            )}
          </div>

          {/* Top Highlights Sidebar (Right 4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-red-600">
              <h3 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-600" />
                <span>{language === 'ne' ? 'प्रमुख समाचारहरू' : 'Top Highlights'}</span>
              </h3>
              <span className="text-[11px] font-bold text-red-600 dark:text-red-400">ताजा</span>
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
        {/* POLITICS CATEGORY MODULE (राजनीति) */}
        {/* ========================================================= */}
        <section className="space-y-5">
          <div className="flex items-center justify-between pb-2 border-b-2 border-red-600">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                {language === 'ne' ? 'राजनीति' : 'Politics'}
              </h2>
            </div>
            <Link
              href="/category/politics"
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              <span>{language === 'ne' ? 'सबै हेर्नुहोस्' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {politicsArticles.length === 0 ? (
              <p className="col-span-full text-xs text-slate-400 py-6 text-center">
                {language === 'ne' ? 'राजनीति विधामा कुनै समाचार छैन।' : 'No politics articles found.'}
              </p>
            ) : (
              politicsArticles.map((art) => (
                <div
                  key={art.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col group"
                >
                  {art.featuredImage && (
                    <Link href={`/news/${art.slug}`} className="relative aspect-16/10 w-full overflow-hidden">
                      <Image
                        src={art.featuredImage}
                        alt={art.title}
                        fill
                        className="object-cover group-hover:scale-103 transition duration-300"
                      />
                    </Link>
                  )}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <Link
                        href={`/news/${art.slug}`}
                        className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-2 leading-snug"
                      >
                        {getLocalizedTitle(art, language)}
                      </Link>
                      {art.subtitle && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {getLocalizedSubtitle(art, language)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>{formatTimeAgo(art.publishedAt)}</span>
                      <span>{art.readTimeMinutes} {t('readTime')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Phase 6: Homepage Billboard Ad Slot (970x250) */}
        <AdBanner placement="HOMEPAGE_BILLBOARD" />

        {/* ========================================================= */}
        {/* ECONOMY & TRENDING 2-COLUMN SECTION */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Economy (8 Cols) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b-2 border-red-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  {language === 'ne' ? 'अर्थ / बजार' : 'Economy & Markets'}
                </h2>
              </div>
              <Link
                href="/category/economy"
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                <span>{language === 'ne' ? 'सबै हेर्नुहोस्' : 'View All'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {economyArticles.map((art) => (
                <div
                  key={art.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col group"
                >
                  {art.featuredImage && (
                    <Link href={`/news/${art.slug}`} className="relative aspect-16/10 w-full overflow-hidden">
                      <Image
                        src={art.featuredImage}
                        alt={art.title}
                        fill
                        className="object-cover group-hover:scale-103 transition duration-300"
                      />
                    </Link>
                  )}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <Link
                      href={`/news/${art.slug}`}
                      className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-2 leading-snug"
                    >
                      {getLocalizedTitle(art, language)}
                    </Link>
                    {art.subtitle && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {getLocalizedSubtitle(art, language)}
                      </p>
                    )}
                    <span className="text-[11px] text-slate-400 block pt-1">
                      {formatTimeAgo(art.publishedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending / Most Read ("धेरै पढिएको" - Right 4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-red-600">
              <h3 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-600" />
                <span>{language === 'ne' ? 'धेरै पढिएको' : 'Most Read / Trending'}</span>
              </h3>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 divide-y divide-slate-100 dark:divide-slate-800 shadow-2xs">
              {trendingArticles.map((story, i) => (
                <div key={story.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 group">
                  <span className="text-xl font-mono font-black text-red-600 shrink-0">
                    {i + 1}
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
                        <span>{story.viewCount} views</span>
                      </span>
                      <span>{formatTimeAgo(story.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {/* Phase 6: Sidebar Rectangle Ad Slot (300x250) */}
              <div className="pt-2">
                <AdBanner placement="SIDEBAR_RECTANGLE" />
              </div>
            </div>
          </div>
        </section>

        {/* Phase 6: Daily Morning Briefing Newsletter Subscription Box */}
        <NewsletterBox />

        {/* ========================================================= */}
        {/* SPORTS CATEGORY MODULE (खेलकुद) */}
        {/* ========================================================= */}
        <section className="space-y-5">
          <div className="flex items-center justify-between pb-2 border-b-2 border-red-600">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                {language === 'ne' ? 'खेलकुद' : 'Sports'}
              </h2>
            </div>
            <Link
              href="/category/sports"
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              <span>{language === 'ne' ? 'सबै हेर्नुहोस्' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {sportsArticles.map((art) => (
              <div
                key={art.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col group"
              >
                {art.featuredImage && (
                  <Link href={`/news/${art.slug}`} className="relative aspect-16/10 w-full overflow-hidden">
                    <Image
                      src={art.featuredImage}
                      alt={art.title}
                      fill
                      className="object-cover group-hover:scale-103 transition duration-300"
                    />
                  </Link>
                )}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <Link
                    href={`/news/${art.slug}`}
                    className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-2 leading-snug"
                  >
                    {getLocalizedTitle(art, language)}
                  </Link>
                  <span className="text-[11px] text-slate-400 pt-1 block">
                    {formatTimeAgo(art.publishedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Phase 6: Sticky Bottom Floating Ad Banner */}
      <AdBanner placement="STICKY_FOOTER" />

      {/* ========================================================= */}
      {/* DYNAMIC FOOTER (Times of India style & Legal Details) */}
      <Footer categories={categories} />
    </div>
  )
}
