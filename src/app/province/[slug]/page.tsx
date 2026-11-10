import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ArticleStatus } from '@/lib/prisma'
import { MapPin, Clock, ChevronRight, Newspaper, ArrowLeft } from 'lucide-react'
import { toNepaliNumerals } from '@/lib/utils/numerals'
import { PROVINCES, getProvinceBySlug } from '@/lib/constants/provinces'

export const revalidate = 60

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabaichha.com'

interface PageProps {
  params: Promise<{ slug: string }>
}

function safeDecodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw).toLowerCase().trim()
  } catch {
    return raw.toLowerCase().trim()
  }
}

function formatRelativeTime(date: Date | null): string {
  if (!date) return ''
  const diffMinutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (diffMinutes < 1) return 'भर्खरै'
  if (diffMinutes < 60) return `${toNepaliNumerals(diffMinutes)} मिनेट अगाडि`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${toNepaliNumerals(diffHours)} घण्टा अगाडि`
  const diffDays = Math.floor(diffHours / 24)
  return `${toNepaliNumerals(diffDays)} दिन अगाडि`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = safeDecodeSlug(slug)
  const prov = getProvinceBySlug(decodedSlug)

  if (!prov) {
    return { title: 'Province Not Found | SabaiChha.com' }
  }

  const title = `${prov.nameNe} समाचार (${prov.nameEn} News) | SabaiChha.com`
  const description = `${prov.descriptionNe} सबै छ डट कममा ${prov.nameNe}का ताजा समाचार, विश्लेषण र विशेष रिपोर्ट।`
  const canonicalUrl = `${SITE_URL}/province/${prov.slug}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'SabaiChha.com | सबै छ डट कम',
      type: 'website',
      images: [`${SITE_URL}/logo.jpg`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/logo.jpg`],
    },
  }
}

export default async function ProvinceArchivePage({ params }: PageProps) {
  const { slug } = await params
  const decodedSlug = safeDecodeSlug(slug)
  const prov = getProvinceBySlug(decodedSlug)

  if (!prov) {
    notFound()
  }

  // Fetch articles: by direct province column, with fallback to keyword in title/excerpt/subtitle
  const [articles, allCategories] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        OR: [
          { province: prov.slug },
          { title: { contains: prov.keyword, mode: 'insensitive' } },
          { excerpt: { contains: prov.keyword, mode: 'insensitive' } },
          { subtitle: { contains: prov.keyword, mode: 'insensitive' } },
        ],
      },
      orderBy: [
        { isCategoryLead: 'desc' },
        { publishedAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        subtitle: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        readTimeMinutes: true,
        isCategoryLead: true,
        category: {
          select: { id: true, nameEn: true, nameNe: true, slug: true },
        },
        author: {
          select: { fullName: true, avatarUrl: true },
        },
      },
      take: 36,
    }),
    prisma.category.findMany({
      where: { showInMenu: true },
      orderBy: { orderIndex: 'asc' },
      select: { id: true, nameEn: true, nameNe: true, slug: true },
    }),
  ])

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'गृहपृष्ठ',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'प्रदेश समाचार',
        item: `${SITE_URL}/province/${prov.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: prov.nameNe,
        item: `${SITE_URL}/province/${prov.slug}`,
      },
    ],
  }

  const leadStory = articles[0]
  const restStories = articles.slice(1)

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header categories={allCategories} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
        
        {/* Province Masthead Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1.5 text-xs font-bold uppercase tracking-wider text-[#C10A1E] dark:text-red-400">
                <MapPin className="w-4 h-4 text-[#C10A1E]" />
                <span>प्रदेश विशेष समाचार (Province Spotlight)</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-[#02267C] dark:text-blue-300 tracking-tight">
                {prov.nameNe}{' '}
                <span className="text-lg sm:text-2xl font-bold text-slate-400 font-sans">
                  ({prov.nameEn})
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-2xl">
                {prov.descriptionNe}
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
              <span className="text-xs font-bold text-slate-500 font-mono">
                {toNepaliNumerals(articles.length)} समाचार उपलब्ध
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                प्रत्यक्ष अपडेट
              </span>
            </div>
          </div>

          {/* Quick-Jump 7 Province Pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              अन्य प्रदेशहरू छान्नुहोस्:
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-1 touch-pan-x">
              {PROVINCES.map((p) => {
                const isCurrent = p.slug === prov.slug
                return (
                  <Link
                    key={p.slug}
                    href={`/province/${p.slug}`}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                      isCurrent
                        ? 'bg-[#C10A1E] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#02267C] hover:text-white'
                    }`}
                  >
                    <span>{p.nameNe}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {articles.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-2xs">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-[#02267C] dark:text-blue-300">
              <Newspaper className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {prov.nameNe}को लागि हाल समाचार फेला परेन
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                यस प्रदेशका नयाँ समाचारहरू चाँडै प्रकाशित गरिनेछ। तपाईं अन्य प्रदेश वा गृहपृष्ठमा जान सक्नुहुन्छ।
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#02267C] text-white text-xs font-bold hover:bg-[#011C5E] transition shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>गृहपृष्ठमा फर्कनुहोस्</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Lead Story: Title ABOVE image for eye-catching impact */}
            {leadStory && (
              <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs hover:border-[#C10A1E]/50 transition space-y-4">
                {/* 1. Category Tag & Read Time */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-[#C10A1E] text-white">
                      {prov.nameNe} मुख्य समाचार
                    </span>
                    {leadStory.category && (
                      <Link
                        href={`/category/${leadStory.category.slug}`}
                        className="text-xs font-bold text-[#02267C] dark:text-blue-400 hover:underline"
                      >
                        {leadStory.category.nameNe}
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatRelativeTime(leadStory.publishedAt)}</span>
                  </div>
                </div>

                {/* 2. Headline ABOVE Image */}
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight sm:leading-snug">
                  <Link
                    href={`/news/${leadStory.slug}`}
                    className="hover:text-[#C10A1E] transition duration-200"
                  >
                    {leadStory.title}
                  </Link>
                </h2>

                {/* Subtitle / Excerpt */}
                {(leadStory.subtitle || leadStory.excerpt) && (
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {leadStory.subtitle || leadStory.excerpt}
                  </p>
                )}

                {/* 3. Featured Image */}
                {leadStory.featuredImage && (
                  <Link
                    href={`/news/${leadStory.slug}`}
                    className="block relative aspect-16/9 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group"
                  >
                    <Image
                      src={leadStory.featuredImage}
                      alt={leadStory.title}
                      fill
                      priority
                      className="object-cover group-hover:scale-102 transition duration-500"
                      sizes="(max-width: 1280px) 100vw, 1200px"
                    />
                  </Link>
                )}

                {/* Author footer */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/logo-circle.png"
                      alt="SabaiChha.com"
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full bg-white object-contain border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <span>{formatRelativeTime(leadStory.publishedAt)}</span>
                  </div>
                  <Link
                    href={`/news/${leadStory.slug}`}
                    className="font-bold text-[#C10A1E] flex items-center gap-1 hover:underline"
                  >
                    <span>पूर्ण समाचार पढ्नुहोस्</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            )}

            {/* Sub-stories Grid (3 columns on lg, 2 on md, 1 on sm) */}
            {restStories.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-[#02267C]">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {prov.nameNe}का अन्य समाचारहरू
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {restStories.map((art) => (
                    <article
                      key={art.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col group"
                    >
                      {art.featuredImage && (
                        <Link
                          href={`/news/${art.slug}`}
                          className="block relative aspect-16/9 w-full overflow-hidden bg-slate-100 dark:bg-slate-800"
                        >
                          <Image
                            src={art.featuredImage}
                            alt={art.title}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </Link>
                      )}

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            {art.category ? (
                              <Link
                                href={`/category/${art.category.slug}`}
                                className="font-bold text-[#02267C] dark:text-blue-400 hover:underline"
                              >
                                {art.category.nameNe}
                              </Link>
                            ) : (
                              <span className="font-bold text-slate-500">{prov.shortNe}</span>
                            )}
                            <span>{formatRelativeTime(art.publishedAt)}</span>
                          </div>

                          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-[#C10A1E] transition">
                            <Link href={`/news/${art.slug}`}>
                              {art.title}
                            </Link>
                          </h3>

                          {art.excerpt && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                              {art.excerpt}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                          <Image
                            src="/logo-circle.png"
                            alt="SabaiChha.com"
                            width={20}
                            height={20}
                            className="w-5 h-5 rounded-full bg-white object-contain border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <span className="text-[#C10A1E] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                            थप <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer categories={allCategories} />
    </div>
  )
}
