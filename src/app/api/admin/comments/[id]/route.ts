import { NextRequest, NextResponse } from 'next/server'
import prisma, { CommentStatus } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'
import { sanitizePlainText } from '@/lib/security/sanitizer'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const { status, content } = body

    const existing = await prisma.comment.findUnique({
      where: { id },
      include: { article: { select: { title: true } } },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Comment not found.' }, { status: 404 })
    }

    const updateData: any = {}

    if (status && ['PENDING', 'APPROVED', 'SPAM'].includes(status)) {
      updateData.status = status as CommentStatus
    }

    if (typeof content === 'string' && content.trim().length > 0) {
      updateData.content = sanitizePlainText(content.trim())
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: updateData,
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: `COMMENT_${status || 'UPDATE'}`,
        targetType: 'COMMENT',
        targetId: id,
        details: `Updated comment by ${existing.authorName} on "${existing.article.title}" to ${status || 'edited'}`,
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      comment: updated,
    })
  } catch (error) {
    console.error('Failed to update comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const existing = await prisma.comment.findUnique({
      where: { id },
      include: { article: { select: { title: true } } },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Comment not found.' }, { status: 404 })
    }

    await prisma.comment.delete({
      where: { id },
    })

    // Log deletion
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'COMMENT_DELETE',
        targetType: 'COMMENT',
        targetId: id,
        details: `Deleted comment by ${existing.authorName} on "${existing.article.title}"`,
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Comment deleted successfully.' })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment.' },
      { status: 500 }
    )
  }
}
