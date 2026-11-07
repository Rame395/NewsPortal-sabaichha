import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'
import { sanitizePlainText } from '@/lib/security/sanitizer'
import { safeHttpUrl } from '@/lib/security/url'
import { AdPlacement, AdStatus, AdType } from '../../../../../../prisma/generated/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, user.permissions, 'ads:manage')) {
      return NextResponse.json({ error: 'Forbidden. You do not have permission to modify advertisements.' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, placement, type, status, imageUrl, targetUrl, scriptCode, startDate, endDate, sponsorName } = body

    const existing = await prisma.advertisement.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 })
    }

    // SECURITY: Only SUPER_ADMIN can edit or set custom HTML / AdSense script ads
    if (
      (type === 'CUSTOM_HTML' ||
        type === 'GOOGLE_ADSENSE' ||
        existing.type === 'CUSTOM_HTML' ||
        existing.type === 'GOOGLE_ADSENSE' ||
        scriptCode !== undefined) &&
      user.role !== 'SUPER_ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Only a Super Admin can modify custom HTML or script-based advertisements.' },
        { status: 403 }
      )
    }

    if (imageUrl !== undefined && imageUrl !== null && imageUrl !== '' && !safeHttpUrl(imageUrl)) {
      return NextResponse.json({ error: 'Invalid image URL.' }, { status: 400 })
    }
    if (targetUrl !== undefined && targetUrl !== null && targetUrl !== '' && !safeHttpUrl(targetUrl)) {
      return NextResponse.json({ error: 'Invalid target URL.' }, { status: 400 })
    }

    const updated = await prisma.advertisement.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: sanitizePlainText(String(title)) }),
        ...(placement !== undefined && Object.values(AdPlacement).includes(placement as AdPlacement) && { placement: placement as AdPlacement }),
        ...(type !== undefined && Object.values(AdType).includes(type as AdType) && { type: type as AdType }),
        ...(status !== undefined && Object.values(AdStatus).includes(status as AdStatus) && { status: status as AdStatus }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl ? safeHttpUrl(imageUrl) : null }),
        ...(targetUrl !== undefined && { targetUrl: targetUrl ? safeHttpUrl(targetUrl) : null }),
        ...(scriptCode !== undefined && user.role === 'SUPER_ADMIN' && { scriptCode: scriptCode ? String(scriptCode) : null }),
        ...(sponsorName !== undefined && { sponsorName: sponsorName ? sanitizePlainText(String(sponsorName)) : null }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'AD_UPDATED',
        targetType: 'Advertisement',
        targetId: id,
        details: `Updated advertisement "${updated.title}" (${updated.placement})`,
      },
    }).catch(() => {})

    return NextResponse.json({ ad: updated })
  } catch (error) {
    console.error('Admin ads PUT error:', error)
    return NextResponse.json({ error: 'Failed to update advertisement' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, user.permissions, 'ads:manage')) {
      return NextResponse.json({ error: 'Forbidden. You do not have permission to delete advertisements.' }, { status: 403 })
    }

    const { id } = await params
    const existing = await prisma.advertisement.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 })
    }

    if ((existing.type === 'CUSTOM_HTML' || existing.type === 'GOOGLE_ADSENSE') && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only a Super Admin can delete script-based advertisements.' }, { status: 403 })
    }

    await prisma.advertisement.delete({
      where: { id },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'AD_DELETED',
        targetType: 'Advertisement',
        targetId: id,
        details: `Deleted advertisement "${existing.title}"`,
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Advertisement deleted.' })
  } catch (error) {
    console.error('Admin ads DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete advertisement' }, { status: 500 })
  }
}
