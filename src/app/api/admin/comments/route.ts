import { NextRequest, NextResponse } from 'next/server'
import prisma, { CommentStatus } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (
      !currentUser ||
      !hasPermission(currentUser.role, currentUser.permissions, 'comments:moderate')
    ) {
      return NextResponse.json(
        { error: 'Unauthorized to moderate comments.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')?.toUpperCase()
    const search = searchParams.get('q') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const whereClause: any = {}

    if (
      statusParam &&
      ['PENDING', 'APPROVED', 'SPAM'].includes(statusParam)
    ) {
      whereClause.status = statusParam as CommentStatus
    }

    if (search.trim()) {
      whereClause.OR = [
        { authorName: { contains: search.trim(), mode: 'insensitive' } },
        { authorEmail: { contains: search.trim(), mode: 'insensitive' } },
        { content: { contains: search.trim(), mode: 'insensitive' } },
        { article: { title: { contains: search.trim(), mode: 'insensitive' } } },
      ]
    }

    // Run parallel queries: counts summary + paginated comments
    const [
      pendingCount,
      approvedCount,
      spamCount,
      allCount,
      totalMatching,
      comments,
    ] = await Promise.all([
      prisma.comment.count({ where: { status: CommentStatus.PENDING } }),
      prisma.comment.count({ where: { status: CommentStatus.APPROVED } }),
      prisma.comment.count({ where: { status: CommentStatus.SPAM } }),
      prisma.comment.count(),
      prisma.comment.count({ where: whereClause }),
      prisma.comment.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          article: {
            select: { id: true, title: true, slug: true },
          },
          parent: {
            select: { id: true, authorName: true, content: true },
          },
        },
      }),
    ])

    return NextResponse.json({
      comments,
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        spam: spamCount,
        all: allCount,
      },
      pagination: {
        page,
        limit,
        total: totalMatching,
        totalPages: Math.ceil(totalMatching / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch comments for moderation:', error)
    return NextResponse.json(
      { error: 'Failed to load comments.' },
      { status: 500 }
    )
  }
}
