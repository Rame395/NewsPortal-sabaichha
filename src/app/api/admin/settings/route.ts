import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'
import { getSiteSettings, AllSettings, invalidateSiteSettingsCache } from '@/lib/settings'
import { neutralizeDangerousUrls } from '@/lib/security/url'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (
      !currentUser ||
      !hasPermission(currentUser.role, currentUser.permissions, 'settings:manage')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const settings = await getSiteSettings()
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Failed to get settings:', error)
    return NextResponse.json({ error: 'Failed to retrieve settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (
      !currentUser ||
      !hasPermission(currentUser.role, currentUser.permissions, 'settings:manage')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const rawBody: Partial<AllSettings> = await request.json()
    // Strip any dangerous URL schemes (javascript:, data:, vbscript:) from settings fields
    const body = neutralizeDangerousUrls(rawBody)

    // Upsert key-values
    const upserts = []

    if (body.siteInfo) {
      upserts.push(
        prisma.siteSetting.upsert({
          where: { key: 'site_info' },
          update: { value: JSON.stringify(body.siteInfo) },
          create: { key: 'site_info', value: JSON.stringify(body.siteInfo) },
        })
      )
    }

    if (body.socialLinks) {
      upserts.push(
        prisma.siteSetting.upsert({
          where: { key: 'social_links' },
          update: { value: JSON.stringify(body.socialLinks) },
          create: { key: 'social_links', value: JSON.stringify(body.socialLinks) },
        })
      )
    }

    if (body.liveTickers) {
      upserts.push(
        prisma.siteSetting.upsert({
          where: { key: 'live_tickers' },
          update: { value: JSON.stringify(body.liveTickers) },
          create: { key: 'live_tickers', value: JSON.stringify(body.liveTickers) },
        })
      )
    }

    if (body.trendingTopics) {
      upserts.push(
        prisma.siteSetting.upsert({
          where: { key: 'trending_topics' },
          update: { value: JSON.stringify(body.trendingTopics) },
          create: { key: 'trending_topics', value: JSON.stringify(body.trendingTopics) },
        })
      )
    }

    if (body.footer) {
      upserts.push(
        prisma.siteSetting.upsert({
          where: { key: 'footer_info' },
          update: { value: JSON.stringify(body.footer) },
          create: { key: 'footer_info', value: JSON.stringify(body.footer) },
        })
      )
    }

    await prisma.$transaction(upserts)
    invalidateSiteSettingsCache()

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'SETTINGS_UPDATE',
        targetType: 'SYSTEM_SETTINGS',
        details: `Updated portal settings (Contact info, Social links, Live widgets, Footer)`,
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      messageEn: 'Settings saved successfully!',
      messageNe: 'सेटिङ्स सफलतापूर्वक सुरक्षित गरियो!',
    })
  } catch (error) {
    console.error('Failed to save settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
