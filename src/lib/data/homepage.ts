import prisma from '@/lib/prisma'
import { ArticleStatus } from '@/lib/prisma'

export async function getHomepageData() {
  try {
    const [
      categories,
      breakingArticles,
      featuredLead,
      topHighlights,
      trendingArticles,
      politicsArticles,
      economyArticles,
      sportsArticles,
    ] = await Promise.all([
      // 1. Categories for Header
      prisma.category.findMany({
        where: { showInMenu: true },
        orderBy: { orderIndex: 'asc' },
        select: { id: true, nameEn: true, nameNe: true, slug: true },
      }),

      // 2. Breaking News Ticker (isBreaking === true)
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED, isBreaking: true },
        take: 5,
        orderBy: { publishedAt: 'desc' },
        select: { id: true, title: true, slug: true },
      }),

      // 3. Main Hero Lead Story (Top featured published article)
      prisma.article.findFirst({
        where: { status: ArticleStatus.PUBLISHED, isFeatured: true },
        orderBy: { publishedAt: 'desc' },
        include: {
          author: { select: { fullName: true, avatarUrl: true } },
          category: { select: { nameEn: true, nameNe: true, slug: true } },
        },
      }),

      // 4. Top Highlights Sidebar (Next 4 latest articles)
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        take: 5,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: { select: { nameEn: true, nameNe: true, slug: true } },
        },
      }),

      // 5. Trending / Most Read Articles (by viewCount)
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        take: 6,
        orderBy: { viewCount: 'desc' },
        include: {
          category: { select: { nameEn: true, nameNe: true, slug: true } },
        },
      }),

      // 6. Politics Articles
      prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          category: { slug: 'politics' },
        },
        take: 4,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: { select: { nameEn: true, nameNe: true, slug: true } },
        },
      }),

      // 7. Economy Articles
      prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          category: { slug: 'economy' },
        },
        take: 4,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: { select: { nameEn: true, nameNe: true, slug: true } },
        },
      }),

      // 8. Sports Articles
      prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          category: { slug: 'sports' },
        },
        take: 4,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: { select: { nameEn: true, nameNe: true, slug: true } },
        },
      }),
    ])

    return {
      categories,
      breakingArticles,
      featuredLead,
      topHighlights,
      trendingArticles,
      politicsArticles,
      economyArticles,
      sportsArticles,
    }
  } catch (error) {
    console.error('Failed to load homepage data:', error)
    return {
      categories: [],
      breakingArticles: [],
      featuredLead: null,
      topHighlights: [],
      trendingArticles: [],
      politicsArticles: [],
      economyArticles: [],
      sportsArticles: [],
    }
  }
}
