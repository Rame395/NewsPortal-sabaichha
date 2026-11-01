import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'
import { Role } from '@/lib/prisma'

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
    const { fullName, email, password, role, permissions, mustChangePassword, bio } = body

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

    if (String(password).length < 8) {
      return NextResponse.json(
        { error: 'Initial password must be at least 8 characters long.' },
        { status: 400 }
      )
    }

    // Role validation
    if (!Object.values(Role).includes(role as Role)) {
      return NextResponse.json({ error: 'Invalid role specified.' }, { status: 400 })
    }

    // Only SUPER_ADMIN can assign the SUPER_ADMIN role to others
    if (role === Role.SUPER_ADMIN && currentUser.role !== Role.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Only a Super Admin can create another Super Admin.' },
        { status: 403 }
      )
    }

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(String(password), salt)

    const newUser = await prisma.user.create({
      data: {
        fullName: String(fullName).trim(),
        email: cleanEmail,
        passwordHash,
        role: role as Role,
        permissions: Array.isArray(permissions) ? permissions : [],
        mustChangePassword: mustChangePassword !== false,
        bio: bio ? String(bio).trim() : null,
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

    // Log the user creation in audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'USER_CREATED',
        targetType: 'User',
        targetId: newUser.id,
        details: `Created staff member ${newUser.email} with role ${newUser.role} and permissions: [${newUser.permissions.join(', ')}]`,
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Staff member account created successfully.',
      user: newUser,
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Failed to create staff account.' },
      { status: 500 }
    )
  }
}
