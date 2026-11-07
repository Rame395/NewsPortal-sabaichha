import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'
import { ArticleStatus } from '@/lib/prisma'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabaichha.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // 1. Static Core Landing Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/rashifal`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tools/gold-silver-rate`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/tools/forex-converter`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/tools/date-converter`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tools/nepali-unicode`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tools/rashifal`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/epaper`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ]

  // 2. Dynamic Categories
  const categories = await prisma.category.findMany({
    where: { showInMenu: true },
    select: { slug: true, createdAt: true },
  })

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/category/${cat.slug}`,
    lastModified: cat.createdAt || now,
    changeFrequency: 'hourly',
    priority: 0.85,
  }))

  // 3. Dynamic Published Articles (up to 1000 latest articles)
  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    orderBy: { publishedAt: 'desc' },
    take: 1000,
    select: {
      slug: true,
      updatedAt: true,
      publishedAt: true,
    },
  })

  const articleRoutes: MetadataRoute.Sitemap = articles.map((art) => ({
    url: `${SITE_URL}/news/${art.slug}`,
    lastModified: art.updatedAt || art.publishedAt || now,
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes]
}
