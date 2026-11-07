import { NextRequest, NextResponse } from 'next/server'
import prisma, { ArticleStatus } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/security/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Prevent polling floods: 60 requests per minute per IP
    const rateLimitResponse = checkRateLimit(request, 'live_polling', {
      maxRequests: 60,
      windowMs: 60 * 1000,
      messageEn: 'Too many live update requests. Please wait a moment.',
      messageNe: 'धेरै पटक ताजा अपडेट अनुरोध गरियो। कृपया केही समय पर्खनुहोस्।',
    })

    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const { id } = await params

    // Verify article exists
    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        isBreaking: true,
        updatedAt: true,
      },
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 })
    }

    // Fetch live updates ordered by latest first
    const updates = await prisma.liveUpdate.findMany({
      where: { articleId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    })

    return NextResponse.json({
      articleId: article.id,
      articleTitle: article.title,
      isBreaking: article.isBreaking,
      lastUpdated: updates.length > 0 ? updates[0].createdAt : article.updatedAt,
      count: updates.length,
      updates,
    })
  } catch (error) {
    console.error('Failed to fetch live updates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch live updates.' },
      { status: 500 }
    )
  }
}
