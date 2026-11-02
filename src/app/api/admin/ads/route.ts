import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { AdPlacement, AdStatus, AdType } from '../../../../../prisma/generated/client'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const placement = searchParams.get('placement')
    const status = searchParams.get('status')
    const search = searchParams.get('search')?.trim()

    const where: any = {}
    if (placement && Object.values(AdPlacement).includes(placement as AdPlacement)) {
      where.placement = placement as AdPlacement
    }
    if (status && Object.values(AdStatus).includes(status as AdStatus)) {
      where.status = status as AdStatus
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { sponsorName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const ads = await prisma.advertisement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Aggregates for dashboard stats
    const totalImpressions = ads.reduce((acc, a) => acc + a.impressions, 0)
    const totalClicks = ads.reduce((acc, a) => acc + a.clicks, 0)
    const activeCount = ads.filter((a) => a.status === 'ACTIVE').length

    return NextResponse.json({
      ads,
      stats: {
        totalAds: ads.length,
        activeAds: activeCount,
        totalImpressions,
        totalClicks,
        ctr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00',
      },
    })
  } catch (error) {
    console.error('Admin ads GET error:', error)
    return NextResponse.json({ error: 'Failed to retrieve ads' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, placement, type, status, imageUrl, targetUrl, scriptCode, startDate, endDate, sponsorName } = body

    if (!title || !placement) {
      return NextResponse.json({ error: 'Title and Placement are required.' }, { status: 400 })
    }

    const ad = await prisma.advertisement.create({
      data: {
        title,
        placement: placement as AdPlacement,
        type: (type as AdType) || 'IMAGE_BANNER',
        status: (status as AdStatus) || 'ACTIVE',
        imageUrl: imageUrl || null,
        targetUrl: targetUrl || null,
        scriptCode: scriptCode || null,
        sponsorName: sponsorName || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    return NextResponse.json({ ad }, { status: 201 })
  } catch (error) {
    console.error('Admin ads POST error:', error)
    return NextResponse.json({ error: 'Failed to create advertisement' }, { status: 500 })
  }
}
