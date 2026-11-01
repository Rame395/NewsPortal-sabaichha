import { NextRequest, NextResponse } from 'next/server'
import prisma, { CommentStatus } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { ids, action } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No comment IDs provided.' }, { status: 400 })
    }

    if (action === 'APPROVE') {
      await prisma.comment.updateMany({
        where: { id: { in: ids } },
        data: { status: CommentStatus.APPROVED },
      })
    } else if (action === 'SPAM') {
      await prisma.comment.updateMany({
        where: { id: { in: ids } },
        data: { status: CommentStatus.SPAM },
      })
    } else if (action === 'DELETE') {
      await prisma.comment.deleteMany({
        where: { id: { in: ids } },
      })
    } else {
      return NextResponse.json({ error: 'Invalid bulk action.' }, { status: 400 })
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: `COMMENT_BULK_${action}`,
        targetType: 'COMMENT',
        details: `Performed bulk action ${action} on ${ids.length} comments.`,
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: `Successfully executed ${action} on ${ids.length} comments.`,
    })
  } catch (error) {
    console.error('Failed to perform bulk comment action:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk action.' },
      { status: 500 }
    )
  }
}
