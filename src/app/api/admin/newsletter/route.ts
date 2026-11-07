import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, user.permissions, 'newsletter:manage')) {
      return NextResponse.json({ error: 'Forbidden. You do not have permission to view newsletter subscribers.' }, { status: 403 })
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      subscribers,
      totalCount: subscribers.length,
      activeCount: subscribers.filter((s) => s.isActive).length,
    })
  } catch (error) {
    console.error('Admin newsletter GET error:', error)
    return NextResponse.json({ error: 'Failed to retrieve subscribers' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, user.permissions, 'newsletter:manage')) {
      return NextResponse.json({ error: 'Forbidden. You do not have permission to manage newsletter subscribers.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 })
    }

    const deleted = await prisma.newsletterSubscriber.delete({
      where: { id },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'NEWSLETTER_SUBSCRIBER_DELETED',
        targetType: 'NewsletterSubscriber',
        targetId: id,
        details: `Removed newsletter subscriber ${deleted.email}`,
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Subscriber removed.' })
  } catch (error) {
    console.error('Admin newsletter DELETE error:', error)
    return NextResponse.json({ error: 'Failed to remove subscriber' }, { status: 500 })
  }
}
