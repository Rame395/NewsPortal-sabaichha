'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useLanguage } from '@/context/language-context'
import { formatBikramSambat } from '@/lib/date/nepali-calendar'
import { getLocalizedTitle, getLocalizedSubtitle, getLocalizedExcerpt } from '@/lib/data/translations'
import { toNepaliNumerals } from '@/lib/utils/numerals'
import { CommentSection } from '@/components/article/comment-section'
import { LiveTimeline } from '@/components/article/live-timeline'
import { ArticleAudioPlayer } from '@/components/article/article-audio-player'
import { AdBanner } from '@/components/ads/ad-banner'
import { BookmarkButton } from '@/components/bookmarks/bookmark-button'
import {
  FacebookIcon,
  TikTokIcon,
  WhatsAppIcon,
} from '@/components/ui/social-icons'
import {
  Calendar,
  Clock,
  Eye,
  Share2,
  Bookmark,
  ChevronRight,
  ChevronUp,
  ListPlus,
  Check,
  Flame,
  User,
  ArrowLeft,
  TrendingUp,
  Sparkles,
  Link2,
} from 'lucide-react'

interface CategoryNav {
  id: number
  nameEn: string
  nameNe: string
  slug: string
}

interface ArticleDetail {
  id: string
  title: string
  slug: string
  subtitle: string | null
  content: string
  excerpt: string | null
  featuredImage: string | null
  imageCaption: string | null
  videoUrl?: string | null
  isBreaking: boolean
  isFeatured: boolean
  viewCount: number
  shareCount?: number
  readTimeMinutes: number
  publishedAt: string | null | Date
  author: {
    fullName: string
    avatarUrl: string | null
    bio: string | null
  }
  category: {
    nameEn: string
    nameNe: string
    slug: string
  }
  tags: { tag: { id: number; name: string; slug: string } }[]
  liveUpdates?: {
    id: string
    headline: string
    content: string
    createdAt: string
    author: {
      fullName: string
      avatarUrl?: string | null
    }
  }[]
}

interface RelatedArticle {
  id: string
  title: string
  slug: string
  subtitle?: string | null
  excerpt?: string | null
  featuredImage: string | null
  publishedAt: string | null | Date
  readTimeMinutes: number
  category?: { nameEn: string; nameNe: string; slug: string }
}

interface TrendingArticleItem {
  id: string
  title: string
  slug: string
  featuredImage: string | null
  publishedAt: string | null
  viewCount: number
  readTimeMinutes: number
  category?: { nameEn: string; nameNe: string }
}

export function ArticleReader({
  article,
  categories,
  relatedArticles = [],
  trendingArticles = [],
}: {
  article: ArticleDetail
  categories: CategoryNav[]
  relatedArticles?: RelatedArticle[]
  trendingArticles?: TrendingArticleItem[]
}) {
  const { language, t } = useLanguage()

  // Font size scale state: default is 'lg' (A+) per client request
  const [fontSize, setFontSize] = React.useState<'base' | 'lg' | 'xl'>('lg')
  const [copied, setCopied] = React.useState(false)
  const [showScrollTop, setShowScrollTop] = React.useState(false)

  // Real-time total share count state
  const [shareCount, setShareCount] = React.useState<number>(article.shareCount || 0)

  const handleShare = (platform: 'facebook' | 'tiktok' | 'whatsapp' | 'copy') => {
    setShareCount((prev) => prev + 1)
    if (article?.id) {
      fetch(`/api/public/articles/${article.id}/share`, {
        method: 'POST',
      }).catch(() => {})
    }

    if (platform === 'facebook') shareOnFacebook()
    else if (platform === 'tiktok') shareOnTikTok()
    else if (platform === 'whatsapp') shareOnWhatsApp()
    else if (platform === 'copy') copyUrlToClipboard()
  }

  // Register view count asynchronously after 3 seconds of reader engagement
  React.useEffect(() => {
    if (!article?.id) return
    const timer = setTimeout(() => {
      fetch(`/api/public/articles/${article.id}/view`, {
        method: 'POST',
      }).catch(() => {})
    }, 3000)

    return () => clearTimeout(timer)
  }, [article?.id])

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const copyUrlToClipboard = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const shareOnFacebook = () => {
    if (typeof window !== 'undefined') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
        '_blank',
        'width=600,height=400'
      )
    }
  }

  const shareOnTikTok = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href).catch(() => {})
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
      window.open('https://www.tiktok.com/@sabaichha', '_blank', 'noopener,noreferrer')
    }
  }

  const shareOnWhatsApp = () => {
    if (typeof window !== 'undefined') {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`,
        '_blank'
      )
    }
  }

  const formattedDate = React.useMemo(() => {
    const d = article.publishedAt ? new Date(article.publishedAt) : new Date()
    const bs = formatBikramSambat(d)
    return language === 'ne' ? bs.fullNepaliDate : bs.fullEnglishDate
  }, [article.publishedAt, language])

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

  const fontClasses: Record<string, string> = {
    base: 'text-[16px] sm:text-[17px] leading-[1.8]',
    lg: 'text-[18px] sm:text-[19px] leading-[1.85]',
    xl: 'text-[21px] sm:text-[22px] leading-[1.9]',
  }

  // Parse YouTube video ID or direct MP4/WebM video if dedicated videoUrl is attached
  const youtubeVideoId = React.useMemo(() => {
    const url = article.videoUrl
    if (!url) return null
    try {
      if (url.includes('youtu.be/')) {
        return url.split('youtu.be/')[1].split('?')[0]
      }
      if (url.includes('youtube.com/watch')) {
        return new URLSearchParams(new URL(url).search).get('v')
      }
      if (url.includes('youtube.com/embed/')) {
        return url.split('youtube.com/embed/')[1].split('?')[0]
      }
    } catch {}
    return null
  }, [article.videoUrl])

  const isDirectVideoFile = React.useMemo(() => {
    const url = article.videoUrl?.toLowerCase().split('?')[0]
    if (!url) return false
    return url.endsWith('.mp4') || url.endsWith('.webm')
  }, [article.videoUrl])

  // Check if the video is already embedded directly inside article.content so we don't render it twice
  const isVideoAlreadyInBody = React.useMemo(() => {
    if (!article.content) return false
    if (youtubeVideoId && article.content.includes(youtubeVideoId)) return true
    if (isDirectVideoFile && article.videoUrl && article.content.includes(article.videoUrl)) return true
    return false
  }, [article.content, youtubeVideoId, isDirectVideoFile, article.videoUrl])

  // Check if the featuredImage is already embedded as an <img> inside article.content so we don't render the same photo twice
  const isFeaturedImageAlreadyInBody = React.useMemo(() => {
    if (!article.content || !article.featuredImage) return false
    return article.content.includes(article.featuredImage)
  }, [article.content, article.featuredImage])

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header categories={categories} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Main Article Left Column */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-7 min-w-0">
            {/* Breadcrumb row */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Link href="/" className="hover:text-red-600 transition">
                {t('home')}
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <Link
                href={`/category/${article.category.slug}`}
                className="hover:text-red-600 font-bold text-red-600 dark:text-red-400"
              >
                {language === 'ne' ? article.category.nameNe : article.category.nameEn}
              </Link>
            </div>

            {/* Article Header Card */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/category/${article.category.slug}`}
                  className="px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white uppercase tracking-wider shadow-xs hover:bg-red-700 transition"
                >
                  {language === 'ne' ? article.category.nameNe : article.category.nameEn}
                </Link>

                {article.isBreaking && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-800">
                    <Flame className="w-3.5 h-3.5 text-red-600" />
                    <span>{language === 'ne' ? 'ताजा अपडेट' : 'BREAKING'}</span>
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 dark:text-white leading-snug sm:leading-tight tracking-tight">
                {getLocalizedTitle(article, language)}
              </h1>

              {article.subtitle && (
                <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                  {getLocalizedSubtitle(article, language)}
                </p>
              )}

              {/* Byline & Metadata Controls */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                {/* Brand Logo Emblem, Publication Date & Reading Time */}
                <div className="flex items-center gap-2 sm:gap-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium py-1">
                  <Image
                    src="/logo-circle.png"
                    alt="SabaiChha.com"
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full bg-white object-contain border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs"
                  />
                  <Calendar className="w-4 h-4 text-red-600 shrink-0" />
                  <span suppressHydrationWarning>{formattedDate}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span suppressHydrationWarning>
                    {language === 'ne' ? toNepaliNumerals(article.readTimeMinutes) : article.readTimeMinutes} {t('readTime')}
                  </span>
                </div>

                {/* Accessibility: Font Size Scaler (A+ only per client request) */}
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full py-1 px-3 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Text</span>
                  <button
                    onClick={() => setFontSize((prev) => (prev === 'lg' ? 'base' : 'lg'))}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-black transition cursor-pointer ${
                      fontSize === 'lg'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={fontSize === 'lg' ? 'A+ size active' : 'Switch to A+ size'}
                  >
                    A+
                  </button>
                </div>
              </div>
            </div>

            {/* Social Sharing Bar: Total Share Count + Actual Branded Social Icons */}
            <div className="flex items-center justify-between py-3 border-y border-slate-200 dark:border-slate-800 text-xs gap-3">
              {/* Left: Share Label & Total Share Count Badge */}
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs sm:text-sm shrink-0">
                  <Share2 className="w-4 h-4 text-[#C10A1E]" />
                  <span>{language === 'ne' ? 'साझा गर्नुहोस्:' : 'Share:'}</span>
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-black text-[11px] sm:text-xs border border-red-200 dark:border-red-900/50 shadow-2xs font-mono shrink-0">
                  {language === 'ne' ? toNepaliNumerals(shareCount) : shareCount} {language === 'ne' ? 'सेयर' : 'shares'}
                </span>
              </div>

              {/* Right: Actual Branded Social Icons */}
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                {/* Facebook */}
                <button
                  type="button"
                  onClick={() => handleShare('facebook')}
                  className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-[#1877F2] hover:bg-[#1565C0] text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105 cursor-pointer"
                  title="Share on Facebook"
                  aria-label="Share on Facebook"
                >
                  <FacebookIcon className="w-4 h-4 fill-white" />
                </button>

                {/* TikTok */}
                <button
                  type="button"
                  onClick={() => handleShare('tiktok')}
                  className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-black dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105 cursor-pointer border border-slate-800 dark:border-slate-700"
                  title="TikTok"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="w-4 h-4 fill-white" />
                </button>

                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={() => handleShare('whatsapp')}
                  className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105 cursor-pointer"
                  title="Share on WhatsApp"
                  aria-label="Share on WhatsApp"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-white" />
                </button>

                {/* Copy Link */}
                <button
                  type="button"
                  onClick={() => handleShare('copy')}
                  className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105 cursor-pointer"
                  title={copied ? (language === 'ne' ? 'लिङ्क कपी भयो!' : 'Link copied!') : (language === 'ne' ? 'लिङ्क कपी गर्नुहोस्' : 'Copy link')}
                  aria-label="Copy link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Link2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Key Takeaways Box (प्रमुख बुँदाहरू) */}
            {article.excerpt && (
              <div className="p-4 sm:p-5 rounded-2xl bg-red-50/70 dark:bg-red-950/20 border-l-4 border-red-600 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold uppercase tracking-wider text-xs">
                  <ListPlus className="w-4 h-4" />
                  <span>{language === 'ne' ? 'समाचारका मुख्य बुँदाहरू (Key Takeaways)' : 'Executive Summary / Key Takeaways'}</span>
                </div>
                <div className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                  {getLocalizedExcerpt(article, language)}
                </div>
              </div>
            )}

            {/* Dedicated 16:9 Video Player (if article has videoUrl and it's not already embedded in body) */}
            {isVideoAlreadyInBody ? null : youtubeVideoId ? (
              <div className="space-y-2">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0&rel=0`}
                    title={article.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
                {article.imageCaption && (
                  <p className="text-xs text-slate-500 italic text-center px-4">
                    {article.imageCaption}
                  </p>
                )}
              </div>
            ) : isDirectVideoFile && article.videoUrl ? (
              <div className="space-y-2">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-black">
                  <video
                    src={article.videoUrl}
                    poster={article.featuredImage || undefined}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
                {article.imageCaption && (
                  <p className="text-xs text-slate-500 italic text-center px-4">
                    {article.imageCaption}
                  </p>
                )}
              </div>
            ) : article.featuredImage && !isFeaturedImageAlreadyInBody ? (
              <div className="space-y-2">
                <div className="relative aspect-16/9 sm:aspect-21/10 w-full max-h-[360px] sm:max-h-[420px] rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-slate-950">
                  <Image
                    src={article.featuredImage}
                    alt={article.title}
                    fill
                    priority
                    className="object-cover object-center"
                  />
                </div>
                {article.imageCaption && (
                  <p className="text-xs text-slate-500 italic text-center px-4">
                    {article.imageCaption}
                  </p>
                )}
              </div>
            ) : null}

            {/* Audio Article Player (समाचार सुन्नुहोस्) - Placed below featured image, slim & unobtrusive */}
            <ArticleAudioPlayer
              title={getLocalizedTitle(article, language)}
              content={article.content}
              language={language}
            />

            {/* Live-Blogging Event Timeline */}
            <LiveTimeline articleId={article.id} initialUpdates={article.liveUpdates} />

            {/* Article Body Content */}
            {/<[a-z][\s\S]*>/i.test(article.content) ? (
              <article
                className={`font-serif text-slate-900 dark:text-slate-100 ${fontClasses[fontSize]} space-y-4 [&_p]:my-4 [&_p]:leading-[1.8] [&_div]:my-3.5 [&_div]:leading-[1.8] [&_div:empty]:h-4 [&_p:empty]:h-4 [&_h1]:text-2xl sm:[&_h1]:text-3xl [&_h1]:font-black [&_h1]:my-5 [&_h1]:text-slate-950 dark:[&_h1]:text-white [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-black [&_h2]:my-4 [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-bold [&_h3]:my-3.5 [&_blockquote]:border-l-4 [&_blockquote]:border-red-600 [&_blockquote]:bg-red-50/60 dark:[&_blockquote]:bg-red-950/20 [&_blockquote]:p-4 sm:[&_blockquote]:p-5 [&_blockquote]:my-6 [&_blockquote]:rounded-r-2xl [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_li]:my-2 [&_a]:text-red-600 [&_a]:underline [&_a]:font-semibold hover:[&_a]:text-red-700 [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_th]:border [&_th]:border-slate-300 dark:[&_th]:border-slate-700 [&_th]:p-2.5 [&_th]:bg-slate-100 dark:[&_th]:bg-slate-800 [&_th]:font-bold [&_th]:text-left [&_td]:border [&_td]:border-slate-300 dark:[&_td]:border-slate-700 [&_td]:p-2.5 [&_img]:rounded-2xl [&_img]:my-6 [&_img]:max-w-full [&_img]:h-auto [&_img]:mx-auto [&_img]:shadow-sm [&_hr]:my-8 [&_hr]:border-slate-200 dark:[&_hr]:border-slate-800`}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : (
              <article
                className={`font-serif text-slate-900 dark:text-slate-100 ${fontClasses[fontSize]} space-y-4`}
              >
                {article.content.split(/\n+/).map((para, idx) => (
                  <p key={idx} className="my-4 leading-[1.8]">
                    {para}
                  </p>
                ))}
              </article>
            )}

            {/* In-Article Inline Ad Slot */}
            <AdBanner placement="ARTICLE_INLINE" className="my-6" />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase mr-1">Tags:</span>
                {article.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Reader Comments */}
            <CommentSection articleId={article.id} articleTitle={article.title} />
          </div>

          {/* Right Column: Sticky Sidebar with Trending News, Ads & Newsletter */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            {/* Trending News Widget ("ट्रेन्डिङ ──") */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
              {/* Header matching reference image: "ट्रेन्डिङ ──" */}
              <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-950 dark:text-white tracking-tight">
                    {language === 'ne' ? 'ट्रेन्डिङ' : 'Trending'}
                  </h2>
                  <span className="w-8 h-0.5 bg-red-600 rounded-full inline-block"></span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60">
                  <Flame className="w-3 h-3 text-red-600 fill-red-600/30" />
                  <span>{language === 'ne' ? 'चर्चामा' : 'Hot'}</span>
                </span>
              </div>

              {/* Trending Items List (Top 5) */}
              {trendingArticles.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {trendingArticles.slice(0, 5).map((item, idx) => (
                    <Link
                      key={item.id}
                      href={`/news/${item.slug}`}
                      className="py-3 first:pt-1 last:pb-1 flex items-start gap-3 group"
                    >
                      {/* Thumbnail on left */}
                      <div className="relative w-24 h-16 sm:w-26 sm:h-18 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
                        {item.featuredImage ? (
                          <Image
                            src={item.featuredImage}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 96px, 104px"
                            className="object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Flame className="w-5 h-5 text-red-500/50" />
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 w-4 h-4 rounded-md bg-slate-900/85 backdrop-blur-xs text-white text-[9px] font-black flex items-center justify-center">
                          {toNepaliNumerals(idx + 1)}
                        </span>
                      </div>

                      {/* Headline & metadata on right */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition leading-snug line-clamp-2">
                          {getLocalizedTitle(item, language)}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                          {item.category && (
                            <span className="font-semibold text-red-600 dark:text-red-400">
                              {language === 'ne' ? item.category.nameNe : item.category.nameEn}
                            </span>
                          )}
                          {item.category && <span>•</span>}
                          <span suppressHydrationWarning>{formatTimeAgo(item.publishedAt)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">
                  {language === 'ne' ? 'थप समाचार छिट्टै उपलब्ध हुनेछ' : 'More updates coming soon'}
                </p>
              )}
            </div>

            {/* Sidebar Rectangle Ad */}
            <AdBanner placement="SIDEBAR_RECTANGLE" />
          </aside>
        </div>

        {/* Full-Width Related News Section at the Bottom of Every News Page */}
        {relatedArticles.length > 0 && (
          <section className="pt-10 mt-8 border-t-2 border-slate-200/90 dark:border-slate-800 space-y-6">
            {/* Header: Title + Accent Line + "View All" Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-6 bg-red-600 rounded-full inline-block" />
                <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  {language === 'ne'
                    ? `सम्बन्धित समाचारहरू (${article.category.nameNe})`
                    : `Related Stories (${article.category.nameEn})`}
                </h3>
              </div>

              <Link
                href={`/category/${article.category.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition group"
              >
                <span>
                  {language === 'ne'
                    ? `‘${article.category.nameNe}’ का सबै समाचार हेर्नुहोस्`
                    : `View all in ${article.category.nameEn}`}
                </span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
            </div>

            {/* 4-Card Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedArticles.map((rel) => {
                const catName =
                  language === 'ne'
                    ? rel.category?.nameNe || article.category.nameNe
                    : rel.category?.nameEn || article.category.nameEn

                return (
                  <article
                    key={rel.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col group"
                  >
                    <Link
                      href={`/news/${rel.slug}`}
                      className="block relative aspect-16/10 w-full overflow-hidden bg-slate-100 dark:bg-slate-800"
                    >
                      {rel.featuredImage ? (
                        <Image
                          src={rel.featuredImage}
                          alt={rel.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition duration-400"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          {catName}
                        </div>
                      )}
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs text-[10px] font-bold text-white border border-white/10">
                        {catName}
                      </span>
                    </Link>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <Link
                          href={`/news/${rel.slug}`}
                          className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition leading-snug line-clamp-2 block"
                        >
                          {getLocalizedTitle(rel, language)}
                        </Link>
                        {(rel.subtitle || rel.excerpt) && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {rel.subtitle
                              ? getLocalizedSubtitle(rel, language)
                              : getLocalizedExcerpt(rel, language)}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span suppressHydrationWarning>{formatTimeAgo(rel.publishedAt)}</span>
                          <span>•</span>
                          <span>
                            {language === 'ne' ? toNepaliNumerals(rel.readTimeMinutes) : rel.readTimeMinutes} {t('readTime')}
                          </span>
                        </div>

                        <BookmarkButton
                          article={{
                            id: rel.id,
                            title: rel.title,
                            slug: rel.slug,
                            featuredImage: rel.featuredImage,
                            categoryName: catName,
                          }}
                          size="sm"
                        />
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </main>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label={language === 'ne' ? 'माथि जानुहोस्' : 'Scroll to top'}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer"
        >
          <ChevronUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* Dynamic Footer */}
      <Footer categories={categories} />
    </div>
  )
}
