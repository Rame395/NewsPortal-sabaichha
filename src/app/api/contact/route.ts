import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendContactInquiryNotification } from '@/lib/email/mailer'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'
import { sanitizePlainText } from '@/lib/security/sanitizer'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // 0. Rate limiting: Max 3 contact submissions per 15 minutes per IP
    const rateLimitResponse = checkRateLimit(req, 'contact_submission', {
      maxRequests: 3,
      windowMs: 15 * 60 * 1000,
      messageEn: 'Too many contact messages sent. Please wait 15 minutes before submitting another inquiry.',
      messageNe: 'छोटो समयमा धेरै सन्देशहरू पठाइयो। कृपया १५ मिनेटपछि पुन: प्रयास गर्नुहोस्।',
    })

    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = await req.json()
    const { name, email, phone, category, subject, message, honeypot } = body

    // 1. Anti-spam honeypot detection (bots filling hidden fields)
    if (honeypot && String(honeypot).trim().length > 0) {
      return NextResponse.json({
        success: true,
        message: 'तपाईंको सन्देश सफलतापूर्वक पठाइयो। हाम्रो टिमले चाँडै सम्पर्क गर्नेछ। (Your message has been sent successfully.)',
      })
    }

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

    const cleanName = sanitizePlainText(name.trim().slice(0, 100))
    const cleanEmail = email.trim().toLowerCase().slice(0, 120)
    const cleanPhone = phone ? sanitizePlainText(String(phone).trim().slice(0, 30)) : undefined
    const cleanSubject = sanitizePlainText(subject.trim().slice(0, 200))
    const cleanMessage = sanitizePlainText(message.trim().slice(0, 5000))
    const cleanCategory = sanitizePlainText((category || 'सामान्य सोधपुछ (General)').slice(0, 100))

    // Send email notification in background (resilient to SMTP failure)
    sendContactInquiryNotification({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      category: cleanCategory,
      subject: cleanSubject,
      message: cleanMessage,
    }).catch((err) => {
      console.error('Failed to send contact notification email:', err)
    })

    // Log the contact submission in database AuditLog for tracking
    try {
      const clientIp = getClientIp(req)
      await prisma.auditLog.create({
        data: {
          action: 'CONTACT_SUBMISSION',
          targetType: 'CONTACT_FORM',
          details: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone || null,
            category: cleanCategory,
            subject: cleanSubject,
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
