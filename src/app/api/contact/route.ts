import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendContactInquiryNotification } from '@/lib/email/mailer'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, category, subject, message } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'पूरा नाम भर्न अनिवार्य छ (Name is required)' }, { status: 400 })
    }

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस् (Valid email is required)' }, { status: 400 })
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return NextResponse.json({ error: 'सम्पर्कको विषय खुलाउनुहोस् (Subject is required)' }, { status: 400 })
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'सन्देशको विस्तृत विवरण लेख्नुहोस् (Message is required)' }, { status: 400 })
    }

    const cleanCategory = category || 'सामान्य सोधपुछ (General)'

    // Send email notification in background (resilient to SMTP failure)
    sendContactInquiryNotification({
      name: name.trim(),
      email: email.trim(),
      phone: phone ? String(phone).trim() : undefined,
      category: cleanCategory,
      subject: subject.trim(),
      message: message.trim(),
    }).catch((err) => {
      console.error('Failed to send contact notification email:', err)
    })

    // Log the contact submission in database AuditLog for tracking
    try {
      const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      await prisma.auditLog.create({
        data: {
          action: 'CONTACT_SUBMISSION',
          targetType: 'CONTACT_FORM',
          details: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone || null,
            category: cleanCategory,
            subject: subject.trim(),
          }),
          ipAddress: clientIp,
        },
      })
    } catch (dbErr) {
      console.error('Failed to log contact inquiry in DB:', dbErr)
    }

    return NextResponse.json({
      success: true,
      message: 'तपाईंको सन्देश सफलतापूर्वक पठाइयो। हाम्रो टिमले चाँडै सम्पर्क गर्नेछ। (Your message has been sent successfully.)',
    })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json({ error: 'सन्देश पठाउन सकिएन, कृपया पुन: प्रयास गर्नुहोस्।' }, { status: 500 })
  }
}
