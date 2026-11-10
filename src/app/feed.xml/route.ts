import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ArticleStatus } from '@/lib/prisma'

export const revalidate = 300

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabaichha.com'

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        slug: true,
        subtitle: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        category: {
          select: { nameNe: true, nameEn: true },
        },
        author: {
          select: { fullName: true },
        },
      },
    })

    const buildDate = new Date().toUTCString()

    const rssItems = articles
      .map((art) => {
        const itemUrl = `${SITE_URL}/news/${art.slug}`
        const pubDate = art.publishedAt ? new Date(art.publishedAt).toUTCString() : buildDate
        const description = art.subtitle || art.excerpt || art.title

        return `
    <item>
      <title>${escapeXml(art.title)}</title>
      <link>${itemUrl}</link>
      <guid isPermaLink="true">${itemUrl}</guid>
      <description>${escapeXml(description)}</description>
      <category>${escapeXml(art.category.nameNe)}</category>
      <author>${escapeXml(art.author.fullName)}</author>
      <pubDate>${pubDate}</pubDate>
      ${art.featuredImage ? `<enclosure url="${escapeXml(art.featuredImage)}" type="image/jpeg" length="0" />` : ''}
    </item>`
      })
      .join('\n')

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>सबै छ डट कम | SabaiChha.com</title>
    <link>${SITE_URL}</link>
    <description>नेपालको आधिकारिक डिजिटल अनलाइन पत्रिका - ताजा समाचार, विचार, अर्थ, समाज, र खेलकुद</description>
    <language>ne-NP</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`

    return new NextResponse(rssFeed, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    })
  } catch (error) {
    console.error('RSS Feed generation error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
