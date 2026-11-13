import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CategoryHeroSection } from '@/components/home/category-hero-section'
import { ArticleStatus } from '@/lib/prisma'
import { Clock, Calendar, ArrowLeft, FolderTree } from 'lucide-react'
import { toNepaliNumerals } from '@/lib/utils/numerals'

export const revalidate = 60

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabaichha.com'

interface PageProps {
  params: Promise<{ slug: string }>
}

function safeDecodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = safeDecodeSlug(slug)

  const category = await prisma.category.findFirst({
    where: {
      OR: [{ slug: decodedSlug }, { slug }],
    },
    select: { slug: true, nameEn: true, nameNe: true, description: true },
  })

  if (!category) {
    return { title: 'Category Not Found | SabaiChha.com' }
  }

  const title = `${category.nameNe} (${category.nameEn}) समाचार | SabaiChha.com`
  const description =
    category.description ||
    `सबै छ डट कममा ${category.nameNe} सम्बन्धी ताजा समाचार, विशेष रिपोर्ट र विश्लेषणहरू।`
  const canonicalUrl = `${SITE_URL}/category/${category.slug}`

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

export default async function CategoryArchivePage({ params }: PageProps) {
  const { slug } = await params
  const decodedSlug = safeDecodeSlug(slug)

  const [category, allCategories] = await Promise.all([
    prisma.category.findFirst({
      where: {
        OR: [{ slug: decodedSlug }, { slug }],
      },
      include: {
        children: {
          select: { id: true, nameEn: true, nameNe: true, slug: true },
        },
        articles: {
          where: { status: ArticleStatus.PUBLISHED },
          take: 24,
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
            videoUrl: true,
            publishedAt: true,
            readTimeMinutes: true,
            isCategoryLead: true,
            author: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
    }),
    prisma.category.findMany({
      where: { showInMenu: true },
      orderBy: { orderIndex: 'asc' },
      select: { id: true, nameEn: true, nameNe: true, slug: true },
    }),
  ])

  if (!category) {
    notFound()
  }

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
        name: category.nameNe,
        item: `${SITE_URL}/category/${category.slug}`,
      },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header categories={allCategories} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Category Title Header with Eye-Catching Red Accent Pillar */}
        <div className="relative pb-5 border-b-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <span className="absolute -bottom-[2px] left-0 w-36 sm:w-56 h-[2px] bg-red-600 rounded-full" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-center gap-1.5 shadow-2xs">
                <FolderTree className="w-3.5 h-3.5" />
                <span>समाचार विधा</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-9 sm:h-11 rounded-full bg-gradient-to-b from-red-600 via-rose-600 to-red-700 shadow-sm shadow-red-600/30 shrink-0" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight flex flex-wrap items-baseline gap-2.5 sm:gap-3">
                <span>{category.nameNe}</span>
                <span className="text-lg sm:text-2xl font-bold text-slate-400 dark:text-slate-500 font-sans">
                  ({category.nameEn})
                </span>
              </h1>
            </div>
            {category.description && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-2xl pl-5 sm:pl-6 leading-relaxed">
                {category.description}
              </p>
            )}
          </div>

          <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 font-mono shadow-2xs self-start sm:self-end">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            {toNepaliNumerals(category.articles.length)} समाचार प्रकाशित
          </span>
        </div>

        {/* Subcategories Pills if any */}
        {category.children && category.children.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400">उपविधाहरू:</span>
            {category.children.map((sub) => (
              <Link
                key={sub.id}
                href={`/category/${sub.slug}`}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-600 hover:text-red-600 transition"
              >
                {sub.nameNe}
              </Link>
            ))}
          </div>
        )}

        {/* Article Grid / Hero Lead Layout */}
        {category.articles.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-3">
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">
              यस विधामा हाल कुनै समाचार प्रकाशित गरिएको छैन।
            </p>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline">
              <ArrowLeft className="w-4 h-4" />
              <span>मुख्य पृष्ठमा फर्कनुहोस्</span>
            </Link>
          </div>
        ) : (
          (() => {
            const heroCount =
              category.layoutStyle === 'PHOTO_CAROUSEL'
                ? 8
                : category.layoutStyle === 'OPINION' || category.layoutStyle === 'GRID_3'
                ? 3
                : category.layoutStyle === 'VIDEO_GALLERY'
                ? 4
                : 5

            const remainingArticles = category.articles.slice(heroCount)

            return (
              <div className="space-y-10">
                {/* 1. Category-Specific Hero Layout */}
                <CategoryHeroSection
                  category={{
                    nameEn: category.nameEn,
                    nameNe: category.nameNe,
                    slug: category.slug,
                    layoutStyle: category.layoutStyle,
                  }}
                  articles={category.articles.slice(0, heroCount)}
                />

                {/* 2. Remaining Category Archive Articles */}
                {remainingArticles.length > 0 && (
                  <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 sm:w-2.5 h-6 rounded-full bg-gradient-to-b from-red-600 via-rose-600 to-red-700 shadow-sm shadow-red-600/30 shrink-0" />
                      <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                        {category.nameNe} : थप समाचारहरू
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {remainingArticles.map((art) => (
                    <div
                      key={art.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col group"
                    >
                      {art.featuredImage ? (
                        <Link href={`/news/${art.slug}`} className="relative aspect-16/10 w-full overflow-hidden">
                          <Image
                            src={art.featuredImage}
                            alt={art.title}
                            fill
                            className="object-cover group-hover:scale-103 transition duration-300"
                          />
                        </Link>
                      ) : (
                        <div className="aspect-16/10 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <span className="text-xs font-mono">No Cover Photo</span>
                        </div>
                      )}

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <Link
                            href={`/news/${art.slug}`}
                            className="text-base font-bold text-slate-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-2 leading-snug"
                          >
                            {art.title}
                          </Link>
                          {art.subtitle && (
                            <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                              {art.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <span>{art.author.fullName}</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-red-500" />
                            <span>{toNepaliNumerals(art.readTimeMinutes)} मिनेट</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
            )
          })()
        )}
      </main>

      <Footer categories={allCategories} />
    </div>
  )
}
