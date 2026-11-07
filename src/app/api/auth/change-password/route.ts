import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSession, getCurrentUser } from '@/lib/auth/session'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = checkRateLimit(request, 'auth_change_password', {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
      messageEn: 'Too many password change attempts. Please wait 15 minutes before trying again.',
      messageNe: 'धेरै पटक पासवर्ड परिवर्तन प्रयास गरियो। कृपया १५ मिनेटपछि पुन: प्रयास गर्नुहोस्।',
    })

    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 200) {
      return NextResponse.json(
        { error: 'New password must be between 8 and 200 characters long.' },
        { status: 400 }
      )
    }

    // If not a first-time password reset, verify current password
    if (!user.mustChangePassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required.' },
          { status: 400 }
        )
      }

      const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
      if (!dbUser) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 })
      }

      const isCurrentMatch = await bcrypt.compare(String(currentPassword), dbUser.passwordHash)
      if (!isCurrentMatch) {
        return NextResponse.json({ error: 'Current password does not match.' }, { status: 400 })
      }
    }

    const salt = await bcrypt.genSalt(12)
    const newHash = await bcrypt.hash(newPassword, salt)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    })

    // SECURITY: Revoke all existing sessions across devices and issue a fresh session for this device
    await prisma.session.deleteMany({ where: { userId: user.id } })
    const ip = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    await createSession(user.id, user.email, user.role, ip, userAgent)

    // Log the event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_CHANGED',
        targetType: 'User',
        targetId: user.id,
        details: 'User successfully updated their password (all prior sessions revoked).',
        ipAddress: ip,
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Password successfully updated.',
    })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating password.' },
      { status: 500 }
    )
  }
}
