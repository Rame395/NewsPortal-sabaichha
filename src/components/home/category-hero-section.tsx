'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronRight,
  ChevronLeft,
  Clock,
  User,
  Quote,
  Play,
  Film,
  Camera,
  Sparkles,
} from 'lucide-react'
import { useLanguage } from '@/context/language-context'
import {
  getLocalizedTitle,
  getLocalizedSubtitle,
  getLocalizedExcerpt,
} from '@/lib/data/translations'
import { toNepaliNumerals } from '@/lib/utils/numerals'
import { BookmarkButton } from '@/components/bookmarks/bookmark-button'

export interface CategoryStorySnippet {
  id: string
  title: string
  slug: string
  subtitle?: string | null
  excerpt?: string | null
  featuredImage?: string | null
  videoUrl?: string | null
  publishedAt: string | null | Date
  readTimeMinutes: number
  author?: { fullName: string; avatarUrl?: string | null }
  category?: { nameEn: string; nameNe: string; slug: string }
}

interface CategoryHeroSectionProps {
  category: {
    nameEn: string
    nameNe: string
    slug: string
    layoutStyle?: string
  }
  articles: CategoryStorySnippet[]
  className?: string
}

export function CategoryHeroSection({
  category,
  articles,
  className = '',
}: CategoryHeroSectionProps) {
  const { language, t } = useLanguage()
  const carouselRef = React.useRef<HTMLDivElement>(null)

  // Automatically hide category section if no published articles exist
  if (!articles || articles.length === 0) {
    return null
  }

  const formatTimeAgo = (dateStr: string | null | Date) => {
    if (!dateStr) return ''
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    if (diff < 1) return language === 'ne' ? 'भर्खरै' : 'Just now'
    if (diff < 60) {
      const num = language === 'ne' ? toNepaliNumerals(diff) : diff
      return `${num} ${language === 'ne' ? 'मिनेट अगाडि' : 'min ago'}`
    }
    const hours = Math.floor(diff / 60)
    if (hours < 24) {
      const num = language === 'ne' ? toNepaliNumerals(hours) : hours
      return `${num} ${language === 'ne' ? 'घण्टा अगाडि' : 'hr ago'}`
    }
    const days = Math.floor(hours / 24)
    const num = language === 'ne' ? toNepaliNumerals(days) : days
    return `${num} ${language === 'ne' ? 'दिन अगाडि' : 'd ago'}`
  }

  const categoryTitle = language === 'ne' ? category.nameNe : category.nameEn

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 340
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  // Lead story is first, followed by up to 4 secondary stories
  const leadStory = articles?.[0]
  const secondaryStories = articles ? articles.slice(1, 5) : []

  return (
    <section className={`space-y-4 sm:space-y-5 ${className}`}>
      {/* Section Header: Category Title + Pink/Red Accent Bar + Circular Arrow Link */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href={`/category/${category.slug}`}
            className="text-lg sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight hover:text-red-600 dark:hover:text-red-400 transition truncate"
          >
            {categoryTitle}
          </Link>
          {/* Horizontal Accent Line matching reference design */}
          <span className="hidden xs:inline-block w-8 sm:w-20 h-1 bg-rose-500/80 dark:bg-rose-400 rounded-full shrink-0" />
        </div>

        {/* Circular Arrow Button ( > ) to open Category Archive */}
        <Link
          href={`/category/${category.slug}`}
          aria-label={`View more in ${categoryTitle}`}
          className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-red-500/80 dark:border-red-500 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition flex items-center justify-center shadow-2xs group"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition" />
        </Link>
      </div>

      {/* Empty State when a category has no published articles yet */}
      {!articles || articles.length === 0 ? (
        <div className="p-6 sm:p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 text-xs sm:text-sm text-slate-400">
          {language === 'ne'
            ? `‘${category.nameNe}’ विधामा हाल कुनै समाचार प्रकाशित गरिएको छैन।`
            : `No articles published in ${category.nameEn} yet.`}
        </div>
      ) : category.layoutStyle === 'OPINION' ? (
        /* ========================================================
           LAYOUT 1: OPINION / EDITORIAL ANALYSIS LAYOUT
           Clean editorial cards without awkward dummy avatars
           ======================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {articles.slice(0, 3).map((art) => (
            <div
              key={art.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-md hover:border-red-500/40 transition-all duration-300 flex flex-col justify-between group relative"
            >
              {/* Optional Article Feature Image */}
              {art.featuredImage ? (
                <Link
                  href={`/news/${art.slug}`}
                  className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 block"
                >
                  <Image
                    src={art.featuredImage}
                    alt={art.title}
                    fill
                    className="object-cover group-hover:scale-104 transition duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#C10A1E] text-white flex items-center gap-1 shadow-xs">
                      <Quote className="w-2.5 h-2.5 fill-white" />
                      <span>{language === 'ne' ? 'विचार' : 'Opinion'}</span>
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="p-4 sm:p-5 pb-0 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-center gap-1">
                    <Quote className="w-2.5 h-2.5 fill-red-600 dark:fill-red-400" />
                    <span>{language === 'ne' ? 'विचार / दृष्टिकोण' : 'Opinion & Analysis'}</span>
                  </span>
                  <Quote className="w-5 h-5 text-red-500/30" />
                </div>
              )}

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <Link
                    href={`/news/${art.slug}`}
                    className="text-base font-serif font-black text-slate-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition leading-snug line-clamp-3 block"
                  >
                    &ldquo;{getLocalizedTitle(art, language)}&rdquo;
                  </Link>

                  {art.subtitle && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {getLocalizedSubtitle(art, language)}
                    </p>
                  )}
                </div>

                {/* Byline Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    <span suppressHydrationWarning>{formatTimeAgo(art.publishedAt)}</span>
                    <span>•</span>
                    <span>
                      {language === 'ne' ? toNepaliNumerals(art.readTimeMinutes) : art.readTimeMinutes} {t('readTime')}
                    </span>
                  </div>

                  <BookmarkButton
                    article={{
                      id: art.id,
                      title: art.title,
                      slug: art.slug,
                      featuredImage: art.featuredImage,
                      categoryName: categoryTitle,
                    }}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : category.layoutStyle === 'GRID_3' ? (
        /* ========================================================
           LAYOUT 2: 3-COLUMN EQUAL PHOTO CARDS
           ======================================================== */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.slice(0, 3).map((art) => (
            <Link
              key={art.id}
              href={`/news/${art.slug}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col group"
            >
              {art.featuredImage && (
                <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={art.featuredImage}
                    alt={art.title}
                    fill
                    className="object-cover group-hover:scale-104 transition duration-300"
                  />
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-2 leading-snug">
                    {getLocalizedTitle(art, language)}
                  </h3>
                  {art.subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {getLocalizedSubtitle(art, language)}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span suppressHydrationWarning>{formatTimeAgo(art.publishedAt)}</span>
                  <span>
                    {language === 'ne' ? toNepaliNumerals(art.readTimeMinutes) : art.readTimeMinutes} {t('readTime')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : category.layoutStyle === 'VIDEO_GALLERY' ? (
        /* ========================================================
           LAYOUT 3: VIDEO GALLERY / MULTIMEDIA THEATER
           Dark cinematic container, play overlays, 1 lead + 3 items
           ======================================================== */
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 text-white rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-red-400 uppercase tracking-wider">
            <Film className="w-4 h-4 text-red-500" />
            <span>
              {language === 'ne' ? 'भिडियो तथा मल्टिमिडिया विशेष' : 'Featured Video Coverage'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Lead Video Story */}
            {leadStory && (
              <div className="lg:col-span-7 space-y-3 group">
                <Link
                  href={`/news/${leadStory.slug}`}
                  className="block relative aspect-16/9 rounded-2xl overflow-hidden bg-black/60 border border-slate-800/80 shadow-lg group"
                >
                  {leadStory.featuredImage ? (
                    <Image
                      src={leadStory.featuredImage}
                      alt={leadStory.title}
                      fill
                      priority
                      className="object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                      {categoryTitle} Video
                    </div>
                  )}

                  {/* Red Play Button Floating Badge */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/10 transition">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300 ring-4 ring-white/20">
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>
                  </div>

                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[11px] font-bold text-white border border-white/10 flex items-center gap-1">
                    <Film className="w-3 h-3 text-red-400" />
                    <span>HD</span>
                  </span>
                </Link>

                <div className="space-y-1.5">
                  <Link
                    href={`/news/${leadStory.slug}`}
                    className="text-base sm:text-lg md:text-xl font-black text-white group-hover:text-red-400 transition leading-snug block"
                  >
                    {getLocalizedTitle(leadStory, language)}
                  </Link>
                  {leadStory.subtitle && (
                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                      {getLocalizedSubtitle(leadStory, language)}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                    <Image
                      src="/logo-circle.png"
                      alt="SabaiChha.com"
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-full bg-white object-contain shrink-0"
                    />
                    <span suppressHydrationWarning>{formatTimeAgo(leadStory.publishedAt)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Side Video Playlist (up to 3 items) */}
            <div className="lg:col-span-5 space-y-3.5">
              {secondaryStories.slice(0, 3).map((video) => (
                <Link
                  key={video.id}
                  href={`/news/${video.slug}`}
                  className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-slate-700 transition flex items-center gap-3.5 group"
                >
                  <div className="relative w-28 h-18 sm:w-32 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-black/50 border border-slate-800">
                    {video.featuredImage ? (
                      <Image
                        src={video.featuredImage}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px]">
                        Video
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center group-hover:scale-110 transition shadow-sm">
                        <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 py-0.5">
                    <h4 className="text-xs sm:text-[13px] font-bold text-slate-100 group-hover:text-red-400 transition leading-snug line-clamp-2">
                      {getLocalizedTitle(video, language)}
                    </h4>
                    <span className="text-[10px] text-slate-400 mt-1.5 block" suppressHydrationWarning>
                      {formatTimeAgo(video.publishedAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : category.layoutStyle === 'MAGAZINE_SPLIT' ? (
        /* ========================================================
           LAYOUT 4: MAGAZINE SPLIT (2 Twin Heroes + Bottom Strip)
           Balanced 50/50 dual lead stories with 3 secondary below
           ======================================================== */
        <div className="space-y-6">
          {/* Top Twin Feature Cards (50% / 50%) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.slice(0, 2).map((story, idx) => (
              <div
                key={story.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
              >
                <Link
                  href={`/news/${story.slug}`}
                  className="block relative aspect-16/10 w-full overflow-hidden bg-slate-100 dark:bg-slate-800"
                >
                  {story.featuredImage ? (
                    <Image
                      src={story.featuredImage}
                      alt={story.title}
                      fill
                      priority={idx === 0}
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      {categoryTitle}
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-[10px] font-black uppercase tracking-wider text-white border border-white/10">
                    {idx === 0
                      ? language === 'ne'
                        ? 'विशेष समाचार'
                        : 'Featured Lead'
                      : language === 'ne'
                      ? 'प्रमुख चर्चा'
                      : 'Spotlight'}
                  </span>
                </Link>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <Link
                      href={`/news/${story.slug}`}
                      className="text-base sm:text-lg font-black text-slate-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition leading-snug block"
                    >
                      {getLocalizedTitle(story, language)}
                    </Link>
                    {(story.subtitle || story.excerpt) && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {story.subtitle
                          ? getLocalizedSubtitle(story, language)
                          : getLocalizedExcerpt(story, language)}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/logo-circle.png"
                        alt="SabaiChha.com"
                        width={22}
                        height={22}
                        className="w-5.5 h-5.5 rounded-full bg-white object-contain border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <span suppressHydrationWarning>{formatTimeAgo(story.publishedAt)}</span>
                    </div>

                    <BookmarkButton
                      article={{
                        id: story.id,
                        title: story.title,
                        slug: story.slug,
                        featuredImage: story.featuredImage,
                        categoryName: categoryTitle,
                      }}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom 3-Card Strip for Articles 3 to 5 */}
          {articles.length > 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              {articles.slice(2, 5).map((story) => (
                <Link
                  key={story.id}
                  href={`/news/${story.slug}`}
                  className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition flex items-start gap-3 group"
                >
                  <div className="relative w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800">
                    {story.featuredImage ? (
                      <Image
                        src={story.featuredImage}
                        alt={story.title}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-[9px]">
                        Story
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition leading-snug line-clamp-2">
                      {getLocalizedTitle(story, language)}
                    </h5>
                    <span className="text-[10px] text-slate-400 mt-1 block" suppressHydrationWarning>
                      {formatTimeAgo(story.publishedAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : category.layoutStyle === 'PHOTO_CAROUSEL' ? (
        /* ========================================================
           LAYOUT 5: PHOTO CAROUSEL / VISUAL GALLERY
           Horizontal swipeable cards with overlay text + arrow controls
           ======================================================== */
        <div className="relative group/carousel">
          {/* Controls: Left & Right Scroll Buttons */}
          <div className="flex items-center justify-end gap-2 mb-3">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mr-auto">
              <Camera className="w-3.5 h-3.5 text-rose-500" />
              <span>{language === 'ne' ? 'फोटो फिचर तथा झलक' : 'Visual Spotlight'}</span>
            </span>

            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              aria-label="Scroll left"
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              aria-label="Scroll right"
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontal Scroll Track */}
          <div
            ref={carouselRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto pb-3 pt-1 scroll-smooth no-scrollbar snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {articles.slice(0, 8).map((art) => (
              <div
                key={art.id}
                className="snap-start shrink-0 w-[260px] sm:w-[300px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col group"
              >
                <Link
                  href={`/news/${art.slug}`}
                  className="block relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-800"
                >
                  {art.featuredImage ? (
                    <Image
                      src={art.featuredImage}
                      alt={art.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      Photo
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white/95 flex items-center gap-1.5 drop-shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span suppressHydrationWarning>{formatTimeAgo(art.publishedAt)}</span>
                  </span>
                </Link>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <Link
                    href={`/news/${art.slug}`}
                    className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition leading-snug line-clamp-3 block"
                  >
                    {getLocalizedTitle(art, language)}
                  </Link>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {language === 'ne' ? toNepaliNumerals(art.readTimeMinutes) : art.readTimeMinutes} {t('readTime')}
                    </span>
                    <BookmarkButton
                      article={{
                        id: art.id,
                        title: art.title,
                        slug: art.slug,
                        featuredImage: art.featuredImage,
                        categoryName: categoryTitle,
                      }}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ========================================================
           LAYOUT 6 (DEFAULT): HERO + LIST LAYOUT
           User reference image: 1 Big Left (60%) + 4 List Right (40%)
           ======================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Big Lead Hero Story (~60% / 7 cols) */}
          <div className="lg:col-span-7 flex flex-col group">
            <Link
              href={`/news/${leadStory.slug}`}
              className="block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-xs relative aspect-16/10 w-full"
            >
              {leadStory.featuredImage ? (
                <Image
                  src={leadStory.featuredImage}
                  alt={leadStory.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover group-hover:scale-104 transition duration-400"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                  {categoryTitle}
                </div>
              )}
            </Link>

            {/* Lead Story Headline */}
            <div className="pt-3.5 space-y-2">
              <Link
                href={`/news/${leadStory.slug}`}
                className="text-base sm:text-lg md:text-xl font-black text-slate-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition leading-snug block"
              >
                {getLocalizedTitle(leadStory, language)}
              </Link>

              {leadStory.subtitle && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {getLocalizedSubtitle(leadStory, language)}
                </p>
              )}

              {/* Byline and Time */}
              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <Image
                    src="/logo-circle.png"
                    alt="SabaiChha.com"
                    width={22}
                    height={22}
                    className="w-5.5 h-5.5 rounded-full bg-white object-contain border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <span suppressHydrationWarning>{formatTimeAgo(leadStory.publishedAt)}</span>
                </div>

                <BookmarkButton
                  article={{
                    id: leadStory.id,
                    title: leadStory.title,
                    slug: leadStory.slug,
                    featuredImage: leadStory.featuredImage,
                    categoryName: categoryTitle,
                  }}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Secondary Stories List (~40% / 5 cols) */}
          <div className="lg:col-span-5 divide-y divide-slate-100 dark:divide-slate-800/80 flex flex-col justify-start">
            {secondaryStories.length > 0 ? (
              secondaryStories.map((story) => (
                <Link
                  key={story.id}
                  href={`/news/${story.slug}`}
                  className="py-3 first:pt-0 last:pb-0 flex items-start gap-3.5 group"
                >
                  {/* Left Thumbnail */}
                  <div className="relative w-28 h-18 sm:w-32 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
                    {story.featuredImage ? (
                      <Image
                        src={story.featuredImage}
                        alt={story.title}
                        fill
                        sizes="(max-width: 640px) 112px, 128px"
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Right Headline & Meta */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition leading-snug line-clamp-2 sm:line-clamp-3">
                      {getLocalizedTitle(story, language)}
                    </h4>
                    <span className="text-[10px] text-slate-400 mt-2 block" suppressHydrationWarning>
                      {formatTimeAgo(story.publishedAt)}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                {language === 'ne'
                  ? 'थप समाचार छिट्टै उपलब्ध हुनेछ'
                  : 'More stories coming soon'}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
