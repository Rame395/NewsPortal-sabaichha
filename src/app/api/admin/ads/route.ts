import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'
import { sanitizePlainText } from '@/lib/security/sanitizer'
import { safeHttpUrl } from '@/lib/security/url'
import { AdPlacement, AdStatus, AdType } from '../../../../../prisma/generated/client'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, user.permissions, 'ads:manage')) {
      return NextResponse.json({ error: 'Forbidden. You do not have permission to manage advertisements.' }, { status: 403 })
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
    if (!user || !hasPermission(user.role, user.permissions, 'ads:manage')) {
      return NextResponse.json({ error: 'Forbidden. You do not have permission to create advertisements.' }, { status: 403 })
    }

    const body = await request.json()
    const { title, placement, type, status, imageUrl, targetUrl, scriptCode, startDate, endDate, sponsorName } = body

    if (!title || !placement) {
      return NextResponse.json({ error: 'Title and Placement are required.' }, { status: 400 })
    }

    if (!Object.values(AdPlacement).includes(placement as AdPlacement)) {
      return NextResponse.json({ error: 'Invalid ad placement.' }, { status: 400 })
    }

    const adType: AdType = type && Object.values(AdType).includes(type as AdType) ? (type as AdType) : 'IMAGE_BANNER'
    const adStatus: AdStatus = status && Object.values(AdStatus).includes(status as AdStatus) ? (status as AdStatus) : 'ACTIVE'

    // SECURITY: Custom HTML / AdSense scripts run on every public page — restrict to SUPER_ADMIN only
    if ((adType === 'CUSTOM_HTML' || adType === 'GOOGLE_ADSENSE' || scriptCode) && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only a Super Admin can create custom HTML or script-based advertisements.' },
        { status: 403 }
      )
    }

    const cleanImageUrl = imageUrl ? safeHttpUrl(imageUrl) : null
    if (imageUrl && !cleanImageUrl) {
      return NextResponse.json({ error: 'Invalid image URL. Only http(s) or relative /uploads paths are allowed.' }, { status: 400 })
    }

    const cleanTargetUrl = targetUrl ? safeHttpUrl(targetUrl) : null
    if (targetUrl && !cleanTargetUrl) {
      return NextResponse.json({ error: 'Invalid target URL. Only http(s) or relative paths are allowed.' }, { status: 400 })
    }

    const ad = await prisma.advertisement.create({
      data: {
        title: sanitizePlainText(String(title)),
        placement: placement as AdPlacement,
        type: adType,
        status: adStatus,
        imageUrl: cleanImageUrl,
        targetUrl: cleanTargetUrl,
        scriptCode: user.role === 'SUPER_ADMIN' && scriptCode ? String(scriptCode) : null,
        sponsorName: sponsorName ? sanitizePlainText(String(sponsorName)) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'AD_CREATED',
        targetType: 'Advertisement',
        targetId: ad.id,
        details: `Created advertisement "${ad.title}" (${ad.placement}, ${ad.type})`,
      },
    }).catch(() => {})

    return NextResponse.json({ ad }, { status: 201 })
  } catch (error) {
    console.error('Admin ads POST error:', error)
    return NextResponse.json({ error: 'Failed to create advertisement' }, { status: 500 })
  }
}
