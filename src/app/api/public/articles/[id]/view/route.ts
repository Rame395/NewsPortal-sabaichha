import { NextRequest, NextResponse } from 'next/server'
import prisma, { ArticleStatus } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/security/rate-limit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params

    if (!articleId || typeof articleId !== 'string') {
      return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 })
    }

    // Rate limit: 1 view increment per IP per article per 3 minutes (prevents bot spam & rapid refreshes)
    const rateLimitResponse = checkRateLimit(request, `article_view_${articleId}`, {
      maxRequests: 1,
      windowMs: 3 * 60 * 1000,
    })

    if (rateLimitResponse) {
      // Return 200 without error so client doesn't complain, but don't increment
      return NextResponse.json({ success: true, cached: true })
    }

    await prisma.article.update({
      where: {
        id: articleId,
        status: ArticleStatus.PUBLISHED,
      },
      data: {
        viewCount: { increment: 1 },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    // Fail silently without breaking reader experience
    return NextResponse.json({ success: false }, { status: 200 })
  }
}
