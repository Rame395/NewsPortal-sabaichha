import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSession } from '@/lib/auth/session'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Brute-force protection: Max 5 login attempts per 15 minutes per IP
    const rateLimitResponse = checkRateLimit(request, 'auth_login', {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
      messageEn: 'Too many failed login attempts. Please try again after 15 minutes.',
      messageNe: 'धेरै पटक लगइन प्रयास गरियो। कृपया १५ मिनेटपछि पुन: प्रयास गर्नुहोस्।',
    })

    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const ip = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const cleanEmail = String(email).trim().toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact the administrator.' },
        { status: 403 }
      )
    }

    const isMatch = await bcrypt.compare(String(password), user.passwordHash)

    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    // Login successful: create session
    await createSession(user.id, user.email, user.role, ip, userAgent)

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        targetType: 'User',
        targetId: user.id,
        details: `Successful sign-in from ${ip}`,
        ipAddress: ip,
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      mustChangePassword: user.mustChangePassword,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        mustChangePassword: user.mustChangePassword,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected server error occurred during sign in.' },
      { status: 500 }
    )
  }
}
