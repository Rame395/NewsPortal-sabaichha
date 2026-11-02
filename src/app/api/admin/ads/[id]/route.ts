import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { AdPlacement, AdStatus, AdType } from '../../../../../../prisma/generated/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    const updated = await prisma.advertisement.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(placement !== undefined && { placement: placement as AdPlacement }),
        ...(type !== undefined && { type: type as AdType }),
        ...(status !== undefined && { status: status as AdStatus }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(targetUrl !== undefined && { targetUrl }),
        ...(scriptCode !== undefined && { scriptCode }),
        ...(sponsorName !== undefined && { sponsorName }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    })

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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.advertisement.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Advertisement deleted.' })
  } catch (error) {
    console.error('Admin ads DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete advertisement' }, { status: 500 })
  }
}
