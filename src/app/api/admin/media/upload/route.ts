import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'
import { saveUploadedFile } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (
      !currentUser ||
      !hasPermission(currentUser.role, currentUser.permissions, [
        'media:upload',
        'articles:create',
        'articles:edit_own',
        'articles:edit_all',
        'ads:manage',
        'settings:manage',
      ])
    ) {
      return NextResponse.json(
        { error: 'Forbidden. You do not have permission to upload media.' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const singleFile = formData.get('file') as File | null
    const altText = (formData.get('altText') as string) || ''

    const uploadList: File[] = []
    if (files && files.length > 0) {
      uploadList.push(...files.filter((f) => f && typeof f.size === 'number' && f.size > 0))
    } else if (singleFile && singleFile.size > 0) {
      uploadList.push(singleFile)
    }

    if (uploadList.length === 0) {
      return NextResponse.json({ error: 'No valid files provided for upload.' }, { status: 400 })
    }

    const results = []

    for (const file of uploadList) {
      try {
        const stored = await saveUploadedFile(file)
        const resolvedAlt = altText || (file.name ? file.name.replace(/\.[^/.]+$/, '') : 'Uploaded Media')

        let mediaRecord: any = {
          id: stored.fileName,
          fileName: stored.fileName,
          fileUrl: stored.fileUrl,
          mimeType: stored.mimeType,
          fileSize: stored.fileSize,
          altText: resolvedAlt,
          uploadedBy: currentUser.id,
          createdAt: new Date().toISOString(),
        }

        try {
          mediaRecord = await prisma.media.create({
            data: {
              fileName: stored.fileName,
              fileUrl: stored.fileUrl,
              mimeType: stored.mimeType,
              fileSize: stored.fileSize,
              altText: resolvedAlt,
              uploadedBy: currentUser.id,
            },
            include: {
              uploader: {
                select: { id: true, fullName: true, email: true },
              },
            },
          })

          await prisma.auditLog.create({
            data: {
              userId: currentUser.id,
              action: 'MEDIA_UPLOADED',
              targetType: 'Media',
              targetId: mediaRecord.id,
              details: `Uploaded file: ${stored.fileName} (${stored.fileSize} bytes)`,
            },
          })
        } catch (dbRecordErr) {
          console.warn('Media metadata record warning (file saved successfully):', dbRecordErr)
        }

        results.push(mediaRecord)
      } catch (err: any) {
        console.error('File upload failed for', file.name, err)
        return NextResponse.json(
          { error: `Failed to upload "${file.name}": ${err.message || 'Unknown error'}` },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      media: results.length === 1 ? results[0] : results,
      uploadedCount: results.length,
    })
  } catch (error: any) {
    console.error('Media upload handler error:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while processing the upload.' },
      { status: 500 }
    )
  }
}
