import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getCurrentUser } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long.' },
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

    // Log the event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_CHANGED',
        targetType: 'User',
        targetId: user.id,
        details: 'User successfully updated their password.',
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
