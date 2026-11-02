import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
    }

    // Upsert so if already subscribed, it remains active
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email: cleanEmail },
      update: { isActive: true },
      create: { email: cleanEmail, isActive: true },
    })

    return NextResponse.json({
      success: true,
      message: 'तपाईंको इमेल सफलतापूर्वक दर्ता भयो! धन्यवाद। (Subscribed successfully!)',
      subscriber,
    })
  } catch (error) {
    console.error('Newsletter subscribe error:', error)
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 })
  }
}
