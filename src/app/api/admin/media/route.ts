import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (
      !currentUser ||
      !hasPermission(currentUser.role, currentUser.permissions, [
        'media:upload',
        'articles:create',
        'articles:edit_own',
        'articles:edit_all',
      ])
    ) {
      return NextResponse.json(
        { error: 'Unauthorized to view media library.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('q') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '24', 10)))
    const skip = (page - 1) * limit

    const whereClause: any = {}
    if (search.trim()) {
      whereClause.OR = [
        { fileName: { contains: search.trim(), mode: 'insensitive' } },
        { altText: { contains: search.trim(), mode: 'insensitive' } },
      ]
    }

    const [total, mediaItems] = await Promise.all([
      prisma.media.count({ where: whereClause }),
      prisma.media.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          uploader: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
    ])

    return NextResponse.json({
      media: mediaItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Fetch media error:', error)
    return NextResponse.json({ error: 'Failed to fetch media records.' }, { status: 500 })
  }
}
