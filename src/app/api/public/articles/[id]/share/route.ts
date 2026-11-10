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

    // Rate limit: max 10 share increments per IP per article per 5 minutes
    const rateLimitResponse = checkRateLimit(request, `article_share_${articleId}`, {
      maxRequests: 10,
      windowMs: 5 * 60 * 1000,
    })

    if (rateLimitResponse) {
      return NextResponse.json({ success: true, rateLimited: true })
    }

    const updated = await prisma.article.update({
      where: {
        id: articleId,
        status: ArticleStatus.PUBLISHED,
      },
      data: {
        shareCount: { increment: 1 },
      },
      select: {
        shareCount: true,
      },
    })

    return NextResponse.json({ success: true, shareCount: updated.shareCount })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 200 })
  }
}
