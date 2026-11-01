import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'
import { deleteStoredFile } from '@/lib/storage'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    const { id } = await params

    if (
      !currentUser ||
      !hasPermission(currentUser.role, currentUser.permissions, [
        'media:upload',
        'articles:delete',
      ])
    ) {
      return NextResponse.json({ error: 'Forbidden. Permission required to delete media.' }, { status: 403 })
    }

    const media = await prisma.media.findUnique({ where: { id } })
    if (!media) {
      return NextResponse.json({ error: 'Media file not found.' }, { status: 404 })
    }

    // Attempt deleting from disk
    await deleteStoredFile(media.fileUrl)

    // Delete database record
    await prisma.media.delete({ where: { id } })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'MEDIA_DELETED',
        targetType: 'Media',
        targetId: id,
        details: `Deleted file: ${media.fileName} (${media.fileUrl})`,
      },
    })

    return NextResponse.json({ success: true, message: 'Media file deleted successfully.' })
  } catch (error) {
    console.error('Delete media error:', error)
    return NextResponse.json({ error: 'Failed to delete media.' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    const { id } = await params

    if (
      !currentUser ||
      !hasPermission(currentUser.role, currentUser.permissions, 'media:upload')
    ) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    const body = await request.json()
    const { altText } = body

    const updated = await prisma.media.update({
      where: { id },
      data: { altText: altText || null },
    })

    return NextResponse.json({ success: true, media: updated })
  } catch (error) {
    console.error('Update media error:', error)
    return NextResponse.json({ error: 'Failed to update media.' }, { status: 500 })
  }
}
