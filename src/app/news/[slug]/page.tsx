import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArticleReader } from '@/components/article/article-reader'
import { ArticleStatus } from '@/lib/prisma'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await prisma.article.findUnique({
    where: { slug },
    select: {
      title: true,
      subtitle: true,
      excerpt: true,
      featuredImage: true,
    },
  })

  if (!article) {
    return {
      title: 'Article Not Found | SabaiChha.com',
    }
  }

  const description = article.subtitle || article.excerpt?.slice(0, 160) || 'SabaiChha.com news article'

  return {
    title: `${article.title} | SabaiChha.com`,
    description,
    openGraph: {
      title: article.title,
      description,
      images: article.featuredImage ? [article.featuredImage] : ['/logo.jpg'],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: article.featuredImage ? [article.featuredImage] : ['/logo.jpg'],
    },
  }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params

  // 1. Fetch the published article
  const article = await prisma.article.findUnique({
    where: { slug },
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
    },
  })

  if (!article || article.status !== ArticleStatus.PUBLISHED) {
    notFound()
  }

  // 2. Increment view count asynchronously
  await prisma.article.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {})

  // 3. Fetch header categories & related articles
  const [categories, relatedArticles] = await Promise.all([
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
      take: 3,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true,
        publishedAt: true,
        readTimeMinutes: true,
      },
    }),
  ])

  return (
    <ArticleReader
      article={article}
      categories={categories}
      relatedArticles={relatedArticles}
    />
  )
}
