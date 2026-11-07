import prisma from '@/lib/prisma'
import { ArticleStatus } from '@/lib/prisma'
import { getSiteSettings } from '@/lib/settings'

export async function getHomepageData() {
  try {
    const [
      siteSettings,
      allCategoriesWithArticles,
      breakingArticles,
      featuredArticles,
      topHighlights,
      trendingArticles,
    ] = await Promise.all([
      // 0. Site Settings including Trending Topics
      getSiteSettings(),

      // 1. All Categories in strict orderIndex ascending order, each with its top 5 published articles
      prisma.category.findMany({
        orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          nameEn: true,
          nameNe: true,
          slug: true,
          orderIndex: true,
          showInMenu: true,
          layoutStyle: true,
          articles: {
            where: { status: ArticleStatus.PUBLISHED },
            take: 5,
            orderBy: [
              { isCategoryLead: 'desc' },
              { publishedAt: 'desc' },
            ],
            include: {
              category: { select: { nameEn: true, nameNe: true, slug: true } },
              author: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
      }),

      // 2. Breaking News Ticker (isBreaking === true)
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED, isBreaking: true },
        take: 5,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          publishedAt: true,
          category: { select: { nameEn: true, nameNe: true } },
        },
      }),

      // 3. Main Hero Featured Stories (Top featured published articles)
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED, isFeatured: true },
        take: 5,
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
    ])

    // Categories shown in Header/Footer navigation bar (ordered by orderIndex)
    const categories = allCategoriesWithArticles
      .filter((c) => c.showInMenu)
      .map(({ id, nameEn, nameNe, slug }) => ({ id, nameEn, nameNe, slug }))

    return {
      trendingTopics: siteSettings.trendingTopics,
      categories,
      categorySections: allCategoriesWithArticles,
      breakingArticles,
      featuredArticles,
      featuredLead: featuredArticles[0] || null,
      topHighlights,
      trendingArticles,
    }
  } catch (error) {
    console.error('Failed to load homepage data:', error)
    return {
      trendingTopics: undefined,
      categories: [],
      categorySections: [],
      breakingArticles: [],
      featuredArticles: [],
      featuredLead: null,
      topHighlights: [],
      trendingArticles: [],
    }
  }
}
