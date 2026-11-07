import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ArticleStatus } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawQuery = searchParams.get('q')?.trim() || ''
    const categorySlug = searchParams.get('category')?.trim() || ''
    const sort = searchParams.get('sort')?.trim() || 'latest'
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 50)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const skip = (page - 1) * limit

    if (!rawQuery && !categorySlug) {
      return NextResponse.json(
        { articles: [], categories: [], total: 0 },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
      )
    }

    // Split query into tokens for multi-term search
    const tokens = rawQuery
      ? rawQuery
          .split(/\s+/)
          .filter((t) => t.length > 0)
          .slice(0, 5) // max 5 search tokens
      : []

    // Build Prisma search conditions
    const whereConditions: any = {
      status: ArticleStatus.PUBLISHED,
    }

    if (categorySlug) {
      whereConditions.category = { slug: categorySlug }
    }

    if (tokens.length > 0) {
      whereConditions.AND = tokens.map((token) => ({
        OR: [
          { title: { contains: token, mode: 'insensitive' } },
          { subtitle: { contains: token, mode: 'insensitive' } },
          { excerpt: { contains: token, mode: 'insensitive' } },
          {
            tags: {
              some: {
                tag: {
                  name: { contains: token, mode: 'insensitive' },
                },
              },
            },
          },
        ],
      }))
    }

    // Determine sorting
    const orderBy: any =
      sort === 'popular'
        ? [{ viewCount: 'desc' }, { publishedAt: 'desc' }]
        : [{ publishedAt: 'desc' }]

    // Parallel fetch: articles, matching categories, and total count
    const [articles, totalCount, matchingCategories] = await Promise.all([
      prisma.article.findMany({
        where: whereConditions,
        take: limit,
        skip,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          subtitle: true,
          excerpt: true,
          featuredImage: true,
          publishedAt: true,
          readTimeMinutes: true,
          viewCount: true,
          category: {
            select: {
              id: true,
              nameEn: true,
              nameNe: true,
              slug: true,
            },
          },
          author: {
            select: {
              fullName: true,
            },
          },
        },
      }),
      prisma.article.count({ where: whereConditions }),
      rawQuery
        ? prisma.category.findMany({
            where: {
              OR: [
                { nameNe: { contains: rawQuery, mode: 'insensitive' } },
                { nameEn: { contains: rawQuery, mode: 'insensitive' } },
                { slug: { contains: rawQuery, mode: 'insensitive' } },
              ],
            },
            take: 3,
            select: {
              id: true,
              nameEn: true,
              nameNe: true,
              slug: true,
            },
          })
        : Promise.resolve([]),
    ])

    return NextResponse.json(
      {
        articles,
        categories: matchingCategories,
        total: totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    )
  } catch (error) {
    console.error('[SEARCH_API_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to perform search', articles: [], categories: [], total: 0 },
      { status: 500 }
    )
  }
}
