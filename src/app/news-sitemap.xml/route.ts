import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ArticleStatus } from '@/lib/prisma'

export const revalidate = 300 // Revalidate every 5 minutes

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabaichha.com'

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  try {
    // Google News sitemap guidelines: Only articles published in the last 48 hours
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

    const recentArticles = await prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: {
          gte: fortyEightHoursAgo,
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 1000,
      select: {
        title: true,
        slug: true,
        publishedAt: true,
      },
    })

    // If no articles in the last 48h (e.g. during launch/initial staging), take the latest 20 published articles
    const articles =
      recentArticles.length > 0
        ? recentArticles
        : await prisma.article.findMany({
            where: { status: ArticleStatus.PUBLISHED },
            orderBy: { publishedAt: 'desc' },
            take: 20,
            select: {
              title: true,
              slug: true,
              publishedAt: true,
            },
          })

    const xmlItems = articles
      .map((art) => {
        const url = `${SITE_URL}/news/${art.slug}`
        const pubDate = art.publishedAt ? new Date(art.publishedAt).toISOString() : new Date().toISOString()

        return `  <url>
    <loc>${url}</loc>
    <news:news>
      <news:publication>
        <news:name>सबै छ डट कम (SabaiChha.com)</news:name>
        <news:language>ne</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(art.title)}</news:title>
    </news:news>
  </url>`
      })
      .join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${xmlItems}
</urlset>`

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Error generating Google News sitemap:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
