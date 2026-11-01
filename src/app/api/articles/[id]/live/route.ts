import { NextRequest, NextResponse } from 'next/server'
import prisma, { ArticleStatus } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
