import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 })
    }

    await prisma.newsletterSubscriber.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Subscriber removed.' })
  } catch (error) {
    console.error('Admin newsletter DELETE error:', error)
    return NextResponse.json({ error: 'Failed to remove subscriber' }, { status: 500 })
  }
}
