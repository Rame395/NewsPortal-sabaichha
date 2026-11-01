'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useLanguage } from '@/context/language-context'
import { getLocalizedTitle, getLocalizedSubtitle, getLocalizedExcerpt } from '@/lib/data/translations'
import { CommentSection } from '@/components/article/comment-section'
import { LiveTimeline } from '@/components/article/live-timeline'
import {
  Calendar,
  Clock,
  Eye,
  Share2,
  Bookmark,
  ChevronRight,
  ListPlus,
  Check,
  Flame,
  User,
  ArrowLeft,
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
  isBreaking: boolean
  isFeatured: boolean
  viewCount: number
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
  featuredImage: string | null
  publishedAt: string | null | Date
  readTimeMinutes: number
}

export function ArticleReader({
  article,
  categories,
  relatedArticles,
}: {
  article: ArticleDetail
  categories: CategoryNav[]
  relatedArticles: RelatedArticle[]
}) {
  const { language, t } = useLanguage()

  // Font size scale state: 'sm' | 'base' | 'lg' | 'xl'
  const [fontSize, setFontSize] = React.useState<'base' | 'lg' | 'xl'>('lg')
  const [copied, setCopied] = React.useState(false)

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

  const shareOnTwitter = () => {
    if (typeof window !== 'undefined') {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`,
        '_blank',
        'width=600,height=400'
      )
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

  const formattedDate = new Date(article.publishedAt || Date.now()).toLocaleDateString(
    language === 'ne' ? 'ne-NP' : 'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )

  const fontClasses: Record<string, string> = {
    base: 'text-base leading-relaxed',
    lg: 'text-lg sm:text-xl leading-relaxed',
    xl: 'text-xl sm:text-2xl leading-loose',
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header categories={categories} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
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

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white leading-tight tracking-tight">
            {getLocalizedTitle(article, language)}
          </h1>

          {article.subtitle && (
            <p className="text-base sm:text-xl font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
              {getLocalizedSubtitle(article, language)}
            </p>
          )}

          {/* Byline & Metadata Controls */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            {/* Author info */}
            <div className="flex items-center gap-3">
              {article.author.avatarUrl ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                  <Image src={article.author.avatarUrl} alt={article.author.fullName} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{article.author.fullName}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{formattedDate}</span>
                  <span>•</span>
                  <span>{article.readTimeMinutes} {t('readTime')}</span>
                </div>
              </div>
            </div>

            {/* Accessibility: Font Size Scaler */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Text</span>
              {(['base', 'lg', 'xl'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition ${
                    fontSize === size
                      ? 'bg-red-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={`Set text size to ${size}`}
                >
                  {size === 'base' ? 'A' : size === 'lg' ? 'A+' : 'A++'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Social Sharing Bar */}
        <div className="flex items-center justify-between py-3 border-y border-slate-200 dark:border-slate-800 text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-red-600" />
            <span>{language === 'ne' ? 'साझा गर्नुहोस्' : 'Share Article'}:</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={shareOnFacebook}
              className="px-3 py-1 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] font-semibold transition"
            >
              Facebook
            </button>
            <button
              onClick={shareOnTwitter}
              className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold transition"
            >
              X / Twitter
            </button>
            <button
              onClick={shareOnWhatsApp}
              className="px-3 py-1 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-semibold transition"
            >
              WhatsApp
            </button>
            <button
              onClick={copyUrlToClipboard}
              className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold transition flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
              <span>{copied ? (language === 'ne' ? 'कपी भयो!' : 'Copied!') : (language === 'ne' ? 'लिङ्क कपी' : 'Copy Link')}</span>
            </button>
          </div>
        </div>

        {/* Key Takeaways Box (प्रमुख बुँदाहरू) */}
        {article.excerpt && (
          <div className="p-5 sm:p-6 rounded-3xl bg-red-50/70 dark:bg-red-950/20 border-l-4 border-red-600 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold uppercase tracking-wider text-xs">
              <ListPlus className="w-4 h-4" />
              <span>{language === 'ne' ? 'समाचारका मुख्य बुँदाहरू (Key Takeaways)' : 'Executive Summary / Key Takeaways'}</span>
            </div>
            <div className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
              {getLocalizedExcerpt(article, language)}
            </div>
          </div>
        )}

        {/* Featured Cover Image */}
        {article.featuredImage && (
          <div className="space-y-2">
            <div className="relative aspect-16/10 w-full rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                priority
                className="object-cover"
              />
            </div>
            {article.imageCaption && (
              <p className="text-xs text-slate-500 italic text-center px-4">
                {article.imageCaption}
              </p>
            )}
          </div>
        )}

        {/* Live-Blogging Event Timeline */}
        <LiveTimeline articleId={article.id} initialUpdates={article.liveUpdates} />

        {/* Article Body Content */}
        {/<[a-z][\s\S]*>/i.test(article.content) ? (
          <article
            className={`font-serif text-slate-900 dark:text-slate-100 leading-relaxed ${fontClasses[fontSize]} space-y-4 [&_h1]:text-2xl sm:[&_h1]:text-3xl [&_h1]:font-black [&_h1]:my-4 [&_h1]:text-slate-950 dark:[&_h1]:text-white [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-black [&_h2]:my-4 [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-bold [&_h3]:my-3 [&_p]:my-3.5 [&_p]:leading-relaxed [&_blockquote]:border-l-4 [&_blockquote]:border-red-600 [&_blockquote]:bg-red-50/60 dark:[&_blockquote]:bg-red-950/20 [&_blockquote]:p-4 sm:[&_blockquote]:p-5 [&_blockquote]:my-6 [&_blockquote]:rounded-r-2xl [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_li]:my-1.5 [&_a]:text-red-600 [&_a]:underline [&_a]:font-semibold hover:[&_a]:text-red-700 [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_th]:border [&_th]:border-slate-300 dark:[&_th]:border-slate-700 [&_th]:p-2.5 [&_th]:bg-slate-100 dark:[&_th]:bg-slate-800 [&_th]:font-bold [&_th]:text-left [&_td]:border [&_td]:border-slate-300 dark:[&_td]:border-slate-700 [&_td]:p-2.5 [&_img]:rounded-2xl [&_img]:my-6 [&_img]:max-w-full [&_img]:h-auto [&_img]:mx-auto [&_img]:shadow-sm [&_hr]:my-8 [&_hr]:border-slate-200 dark:[&_hr]:border-slate-800`}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <article
            className={`font-serif text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed ${
              fontClasses[fontSize]
            }`}
          >
            {article.content}
          </article>
        )}

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

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div className="pt-10 border-t-2 border-red-600 space-y-5">
            <h3 className="text-xl font-black text-slate-950 dark:text-white">
              {language === 'ne' ? 'सम्बन्धित समाचारहरू' : 'Related Stories'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/news/${rel.slug}`}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col group"
                >
                  {rel.featuredImage && (
                    <div className="relative aspect-16/10 w-full overflow-hidden">
                      <Image
                        src={rel.featuredImage}
                        alt={rel.title}
                        fill
                        className="object-cover group-hover:scale-103 transition duration-300"
                      />
                    </div>
                  )}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-2 leading-snug">
                      {getLocalizedTitle(rel, language)}
                    </h4>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {rel.readTimeMinutes} {t('readTime')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Dynamic Footer */}
      <Footer categories={categories} />
    </div>
  )
}
