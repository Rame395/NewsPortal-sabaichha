import prisma from '@/lib/prisma'
import { ArticleStatus } from '@/lib/prisma'
import { getSiteSettings } from '@/lib/settings'

// Lean field selector for homepage cards (avoids fetching megabytes of raw content/contentHtml)
const HOMEPAGE_ARTICLE_SELECT = {
  id: true,
  title: true,
  slug: true,
  subtitle: true,
  excerpt: true,
  featuredImage: true,
  imageCaption: true,
  videoUrl: true,
  status: true,
  viewCount: true,
  readTimeMinutes: true,
  isFeatured: true,
  isBreaking: true,
  isCategoryLead: true,
  publishedAt: true,
  category: {
    select: { nameEn: true, nameNe: true, slug: true },
  },
  author: {
    select: { fullName: true, avatarUrl: true },
  },
} as const

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
            select: HOMEPAGE_ARTICLE_SELECT,
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
        select: HOMEPAGE_ARTICLE_SELECT,
      }),

      // 4. Top Highlights Sidebar (Next 4-5 latest articles)
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        take: 5,
        orderBy: { publishedAt: 'desc' },
        select: HOMEPAGE_ARTICLE_SELECT,
      }),

      // 5. Trending / Most Read Articles (Top 5 by isTrending & viewCount)
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        take: 5,
        orderBy: [
          { isTrending: 'desc' },
          { viewCount: 'desc' },
          { publishedAt: 'desc' },
        ],
        select: HOMEPAGE_ARTICLE_SELECT,
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
