import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission, sanitizePermissionList } from '@/lib/auth/permissions'
import { Role } from '@/lib/prisma'
import { sanitizePlainText } from '@/lib/security/sanitizer'
import { sendStaffWelcomeEmail } from '@/lib/email/mailer'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || !hasPermission(currentUser.role, currentUser.permissions, 'users:manage')) {
      return NextResponse.json(
        { error: 'Forbidden. You do not have permission to manage staff users.' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        permissions: true,
        mustChangePassword: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            articles: true,
          },
        },
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Fetch users error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve staff users.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || !hasPermission(currentUser.role, currentUser.permissions, 'users:manage')) {
      return NextResponse.json(
        { error: 'Forbidden. Only administrators can create new staff accounts.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { fullName, email, password, role, permissions, mustChangePassword, bio, sendWelcomeEmail } = body

    if (!fullName || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Full name, email, password, and role are required.' },
        { status: 400 }
      )
    }

    const cleanEmail = String(email).trim().toLowerCase()

    // Validate email uniqueness
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A staff member with this email already exists.' },
        { status: 400 }
      )
    }

    if (String(password).length < 8 || String(password).length > 200) {
      return NextResponse.json(
        { error: 'Initial password must be between 8 and 200 characters long.' },
        { status: 400 }
      )
    }

    // Role validation
    if (!Object.values(Role).includes(role as Role)) {
      return NextResponse.json({ error: 'Invalid role specified.' }, { status: 400 })
    }

    const actorIsSuperAdmin = currentUser.role === Role.SUPER_ADMIN

    // Only SUPER_ADMIN can assign the SUPER_ADMIN role to others
    if (role === Role.SUPER_ADMIN && !actorIsSuperAdmin) {
      return NextResponse.json(
        { error: 'Only a Super Admin can create another Super Admin.' },
        { status: 403 }
      )
    }

    // Validate permissions: only known keys, and non-super-admins can only grant permissions they hold
    const requestedPerms = sanitizePermissionList(permissions)
    const grantablePerms = actorIsSuperAdmin
      ? requestedPerms
      : requestedPerms.filter((p) => currentUser.permissions.includes(p))

    if (grantablePerms.length !== requestedPerms.length) {
      return NextResponse.json(
        { error: 'You cannot grant permissions that you do not hold yourself.' },
        { status: 403 }
      )
    }

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(String(password), salt)

    const newUser = await prisma.user.create({
      data: {
        fullName: sanitizePlainText(String(fullName)),
        email: cleanEmail,
        passwordHash,
        role: role as Role,
        permissions: grantablePerms,
        mustChangePassword: mustChangePassword !== false,
        bio: bio ? sanitizePlainText(String(bio)) : null,
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        permissions: true,
        mustChangePassword: true,
        isActive: true,
        createdAt: true,
      },
    })

    // Send welcome onboarding email with login credentials if requested (default true)
    let emailStatus = { sent: false, error: null as string | null }
    if (sendWelcomeEmail !== false) {
      try {
        const mailResult = await sendStaffWelcomeEmail({
          to: cleanEmail,
          fullName: String(fullName),
          email: cleanEmail,
          password: String(password),
          role: String(role),
        })
        if (mailResult.success) {
          emailStatus.sent = true
        } else {
          emailStatus.error = mailResult.error || 'Failed to dispatch email'
        }
      } catch (err: unknown) {
        console.error('Welcome email dispatch error:', err)
        emailStatus.error = err instanceof Error ? err.message : 'Unknown mailer error'
      }
    }

    // Log the user creation in audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'USER_CREATED',
        targetType: 'User',
        targetId: newUser.id,
        details: `Created staff member ${newUser.email} with role ${newUser.role}. Credentials email: ${emailStatus.sent ? 'Sent successfully' : emailStatus.error ? `Failed (${emailStatus.error})` : 'Skipped'}`,
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: emailStatus.sent
        ? `Staff member created successfully and login credentials were sent to ${cleanEmail}.`
        : 'Staff member account created successfully.',
      user: newUser,
      emailStatus,
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Failed to create staff account.' },
      { status: 500 }
    )
  }
}
