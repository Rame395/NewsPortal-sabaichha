import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'
import { Role } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    if (!currentUser || !hasPermission(currentUser.role, currentUser.permissions, 'users:manage')) {
      return NextResponse.json({ error: 'Forbidden. Permission denied.' }, { status: 403 })
    }

    const targetUser = await prisma.user.findUnique({ where: { id } })
    if (!targetUser) {
      return NextResponse.json({ error: 'Staff member not found.' }, { status: 404 })
    }

    const body = await request.json()
    const { isActive, permissions, role, newPassword } = body

    const updateData: Record<string, unknown> = {}

    // 1. Status toggle
    if (typeof isActive === 'boolean') {
      if (id === currentUser.id && !isActive) {
        return NextResponse.json({ error: 'You cannot deactivate your own account.' }, { status: 400 })
      }
      updateData.isActive = isActive

      // If deactivated, kill all existing sessions immediately
      if (!isActive) {
        await prisma.session.deleteMany({ where: { userId: id } })
      }
    }

    // 2. Role update
    if (role && Object.values(Role).includes(role as Role)) {
      if (role === Role.SUPER_ADMIN && currentUser.role !== Role.SUPER_ADMIN) {
        return NextResponse.json({ error: 'Only Super Admins can assign the Super Admin role.' }, { status: 403 })
      }
      updateData.role = role as Role
    }

    // 3. Permissions update
    if (Array.isArray(permissions)) {
      updateData.permissions = permissions
    }

    // 4. Password reset by admin
    if (newPassword && typeof newPassword === 'string' && newPassword.length >= 8) {
      const salt = await bcrypt.genSalt(12)
      updateData.passwordHash = await bcrypt.hash(newPassword, salt)
      updateData.mustChangePassword = true
      // Revoke old sessions so they must log in with new password
      await prisma.session.deleteMany({ where: { userId: id } })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        permissions: true,
        mustChangePassword: true,
        isActive: true,
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'USER_UPDATED',
        targetType: 'User',
        targetId: id,
        details: `Updated staff user ${targetUser.email} with modifications: ${Object.keys(updateData).join(', ')}`,
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Staff member updated successfully.',
      user: updated,
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Failed to update staff member.' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Only Super Administrators can permanently delete staff accounts.' }, { status: 403 })
    }

    if (id === currentUser.id) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Staff member deleted.' })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Failed to delete staff member.' }, { status: 500 })
  }
}
