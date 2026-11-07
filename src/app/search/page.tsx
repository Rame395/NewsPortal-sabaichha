import prisma from '@/lib/prisma'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { ArticleStatus } from '@/lib/prisma'
import { SearchPageClient } from '@/components/search/search-page-client'
import { Footer } from '@/components/layout/footer'

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `"${q}" का लागि खोजी परिणाम | SabaiChha.com` : 'समाचार खोजी | SabaiChha.com',
    description: q
      ? `SabaiChha.com मा "${q}" सँग सम्बन्धित ताजा समाचार तथा विचारहरू`
      : 'नेपालका ताजा तथा आधिकारिक समाचार खोजी गर्नुहोस्',
  }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, category, sort } = await searchParams
  const query = q?.trim() || ''
  const categorySlug = category?.trim() || ''
  const sortMode = sort?.trim() || 'latest'

  // Fetch navigation categories for header
  const navCategories = await prisma.category.findMany({
    where: { showInMenu: true },
    orderBy: { orderIndex: 'asc' },
    select: { id: true, nameEn: true, nameNe: true, slug: true },
  })

  // Tokenize query into words (multi-term search)
  const tokens = query
    ? query
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 5)
    : []

  const baseWhere: any = {
    status: ArticleStatus.PUBLISHED,
  }

  if (tokens.length > 0) {
    baseWhere.AND = tokens.map((token) => ({
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

  // If a category filter is selected
  const articleWhere = categorySlug
    ? { ...baseWhere, category: { slug: categorySlug } }
    : baseWhere

  const orderBy: any =
    sortMode === 'popular'
      ? [{ viewCount: 'desc' }, { publishedAt: 'desc' }]
      : [{ publishedAt: 'desc' }]

  // Fetch articles (optimized: exclude heavy content field), total count, and category facets
  const [articles, totalCount, allCategoriesWithCount] = await Promise.all([
    query || categorySlug
      ? prisma.article.findMany({
          where: articleWhere,
          take: 30,
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
        })
      : Promise.resolve([]),

    query || categorySlug
      ? prisma.article.count({ where: baseWhere })
      : Promise.resolve(0),

    // Facet counts per category
    query
      ? prisma.category.findMany({
          where: {
            articles: {
              some: baseWhere,
            },
          },
          select: {
            id: true,
            nameEn: true,
            nameNe: true,
            slug: true,
            _count: {
              select: {
                articles: {
                  where: baseWhere,
                },
              },
            },
          },
        })
      : Promise.resolve([]),
  ])

  const categoryFacets = allCategoriesWithCount.map((cat) => ({
    id: cat.id,
    nameEn: cat.nameEn,
    nameNe: cat.nameNe,
    slug: cat.slug,
    count: cat._count.articles,
  }))

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header categories={navCategories} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <SearchPageClient
          initialQuery={query}
          initialCategory={categorySlug}
          initialSort={sortMode}
          articles={articles}
          categories={categoryFacets}
          totalCount={totalCount}
        />
      </main>

      <Footer />
    </div>
  )
}
