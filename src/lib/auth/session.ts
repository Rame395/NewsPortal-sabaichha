import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

import { getJwtSecret } from '@/lib/auth/jwt'

const SESSION_COOKIE_NAME = 'sabaichha_session'
const SESSION_EXPIRY_DAYS = 7

export interface AuthSessionPayload {
  sessionId: string
  userId: string
  email: string
  role: string
}

export async function createSession(
  userId: string,
  email: string,
  role: string,
  ipAddress?: string,
  userAgent?: string
) {
  const cookieStore = await cookies()
  const rawToken = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  // Record session in database for instant revocation capability
  const dbSession = await prisma.session.create({
    data: {
      userId,
      token: rawToken,
      expiresAt,
      ipAddress,
      userAgent,
    },
  })

  // Sign encrypted JWT wrapping session ID
  const jwt = await new SignJWT({
    sessionId: dbSession.id,
    userId,
    email,
    role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRY_DAYS}d`)
    .sign(getJwtSecret())

  // Set secure HTTP-only cookie
  cookieStore.set(SESSION_COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })

  // Update user's last login timestamp
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  })

  return dbSession
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!token) return null

    const { payload } = await jwtVerify(token, getJwtSecret())
    const { sessionId, userId } = payload as unknown as AuthSessionPayload

    if (!sessionId || !userId) return null

    // Verify session still exists and has not expired in database
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            permissions: true,
            mustChangePassword: true,
            isActive: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    })

    if (!session || session.expiresAt < new Date()) {
      return null
    }

    if (!session.user || !session.user.isActive) {
      return null
    }

    return session.user
  } catch {
    return null
  }
}

export async function destroySession() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (token) {
      try {
        const { payload } = await jwtVerify(token, getJwtSecret())
        const { sessionId } = payload as unknown as AuthSessionPayload
        if (sessionId) {
          await prisma.session.delete({ where: { id: sessionId } }).catch(() => {})
        }
      } catch {
        // Ignored if expired or invalid
      }
    }

    cookieStore.delete(SESSION_COOKIE_NAME)
  } catch {
    // Ignore error
  }
}
