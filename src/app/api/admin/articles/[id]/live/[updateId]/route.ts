import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; updateId: string }> }
) {
  try {
    const currentUser = await getCurrentUser()

    if (
      !currentUser ||
      !hasPermission(currentUser.role, currentUser.permissions, [
        'articles:create',
        'articles:edit_own',
        'articles:edit_all',
        'breaking:manage',
      ])
    ) {
      return NextResponse.json(
        { error: 'Unauthorized to delete live updates.' },
        { status: 403 }
      )
    }

    const { id, updateId } = await params

    const existing = await prisma.liveUpdate.findUnique({
      where: { id: updateId },
      include: {
        article: { select: { id: true, title: true } },
      },
    })

    if (!existing || existing.articleId !== id) {
      return NextResponse.json({ error: 'Live update entry not found.' }, { status: 404 })
    }

    await prisma.liveUpdate.delete({
      where: { id: updateId },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'LIVE_UPDATE_DELETE',
        targetType: 'ARTICLE',
        targetId: id,
        details: `Deleted live update: "${existing.headline}" from "${existing.article.title}"`,
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Live update removed.',
    })
  } catch (error) {
    console.error('Failed to delete live update:', error)
    return NextResponse.json(
      { error: 'Failed to delete live update.' },
      { status: 500 }
    )
  }
}
