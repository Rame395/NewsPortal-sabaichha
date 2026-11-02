import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { AdPlacement } from '../../../../../prisma/generated/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const placementParam = searchParams.get('placement')

    const whereClause: any = {
      status: 'ACTIVE',
    }

    if (placementParam && Object.values(AdPlacement).includes(placementParam as AdPlacement)) {
      whereClause.placement = placementParam as AdPlacement
    }

    const now = new Date()
    whereClause.OR = [
      { endDate: null },
      { endDate: { gte: now } },
    ]

    const ads = await prisma.advertisement.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    })

    // Increment impressions asynchronously for retrieved ads
    if (ads.length > 0) {
      const ids = ads.map((a) => a.id)
      prisma.advertisement
        .updateMany({
          where: { id: { in: ids } },
          data: { impressions: { increment: 1 } },
        })
        .catch((err) => console.error('Failed to increment ad impressions:', err))
    }

    return NextResponse.json({ ads })
  } catch (error) {
    console.error('Error fetching public ads:', error)
    return NextResponse.json({ error: 'Failed to retrieve ads' }, { status: 500 })
  }
}
