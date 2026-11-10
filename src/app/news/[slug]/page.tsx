import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArticleReader } from '@/components/article/article-reader'
import { ArticleStatus } from '@/lib/prisma'
import { sanitizeArticleHtml } from '@/lib/security/sanitizer'

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

  const article = await prisma.article.findFirst({
    where: {
      OR: [{ slug: decodedSlug }, { slug }],
    },
    select: {
      title: true,
      slug: true,
      subtitle: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
      updatedAt: true,
      category: { select: { nameNe: true, nameEn: true } },
      author: { select: { fullName: true } },
      tags: { select: { tag: { select: { name: true } } } },
    },
  })

  if (!article) {
    return {
      title: 'Article Not Found | SabaiChha.com',
    }
  }

  const description =
    article.subtitle ||
    article.excerpt?.replace(/\n/g, ' ').slice(0, 160) ||
    'SabaiChha.com news article'

  const canonicalUrl = `${SITE_URL}/news/${article.slug}`
  const imageUrl = article.featuredImage || `${SITE_URL}/logo.jpg`
  const keywords = article.tags.map((t) => t.tag.name)

  return {
    title: `${article.title} | SabaiChha.com`,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.title,
      description,
      url: canonicalUrl,
      siteName: 'SabaiChha.com | सबै छ डट कम',
      publishedTime: article.publishedAt ? article.publishedAt.toISOString() : undefined,
      modifiedTime: article.updatedAt ? article.updatedAt.toISOString() : undefined,
      authors: [article.author.fullName],
      section: article.category.nameNe,
      tags: keywords,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: 'article',
      locale: 'ne_NP',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params
  const decodedSlug = safeDecodeSlug(slug)

  // 1. Fetch the published article (matching decoded Unicode or raw encoded slug)
  const article = await prisma.article.findFirst({
    where: {
      OR: [{ slug: decodedSlug }, { slug }],
    },
    include: {
      author: {
        select: { fullName: true, avatarUrl: true, bio: true },
      },
      category: {
        select: { nameEn: true, nameNe: true, slug: true },
      },
      tags: {
        include: { tag: true },
      },
      liveUpdates: {
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { fullName: true, avatarUrl: true } },
        },
      },
    },
  })

  if (!article || article.status !== ArticleStatus.PUBLISHED) {
    notFound()
  }

  // 2. Fetch header categories, related articles (strictly same category), and top 5 trending articles
  const [categories, relatedArticles, trendingArticles] = await Promise.all([
    prisma.category.findMany({
      where: { showInMenu: true },
      orderBy: { orderIndex: 'asc' },
      select: { id: true, nameEn: true, nameNe: true, slug: true },
    }),
    prisma.article.findMany({
      where: {
        categoryId: article.categoryId,
        status: ArticleStatus.PUBLISHED,
        NOT: { id: article.id },
      },
      take: 4,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        subtitle: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        readTimeMinutes: true,
        category: { select: { nameEn: true, nameNe: true, slug: true } },
      },
    }),
    prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        NOT: { id: article.id },
      },
      take: 5,
      orderBy: [
        { isTrending: 'desc' },
        { viewCount: 'desc' },
        { publishedAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true,
        publishedAt: true,
        viewCount: true,
        readTimeMinutes: true,
        category: { select: { nameEn: true, nameNe: true } },
      },
    }),
  ])

  const serializedArticle = {
    ...article,
    content: sanitizeArticleHtml(article.content),
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    liveUpdates: article.liveUpdates.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    })),
  }

  const serializedRelated = relatedArticles.map((r) => ({
    ...r,
    publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
  }))

  const serializedTrending = trendingArticles.map((t) => ({
    ...t,
    publishedAt: t.publishedAt ? t.publishedAt.toISOString() : null,
  }))

  // Structured Data (Schema.org NewsArticle & BreadcrumbList) for Google News / Discover
  const canonicalUrl = `${SITE_URL}/news/${article.slug}`
  const imageUrl = article.featuredImage || `${SITE_URL}/logo.jpg`

  const newsArticleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: article.title,
    description: article.subtitle || article.excerpt?.slice(0, 160) || article.title,
    image: [imageUrl],
    datePublished: article.publishedAt ? article.publishedAt.toISOString() : article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: article.author.fullName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SabaiChha.com',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.jpg`,
      },
    },
    articleSection: article.category.nameNe,
    keywords: article.tags.map((t) => t.tag.name).join(', '),
    inLanguage: 'ne-NP',
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
        name: article.category.nameNe,
        item: `${SITE_URL}/category/${article.category.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: canonicalUrl,
      },
    ],
  }

  return (
    <>
      {/* Schema.org NewsArticle & Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <ArticleReader
        article={serializedArticle}
        categories={categories}
        relatedArticles={serializedRelated}
        trendingArticles={serializedTrending}
      />
    </>
  )
}
