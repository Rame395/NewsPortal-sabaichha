import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ad = await prisma.advertisement.findUnique({
      where: { id },
    })

    if (!ad) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 })
    }

    // Increment click count
    await prisma.advertisement.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    })

    return NextResponse.json({ success: true, targetUrl: ad.targetUrl || '/' })
  } catch (error) {
    console.error('Error recording ad click:', error)
    return NextResponse.json({ error: 'Failed to record click' }, { status: 500 })
  }
}
