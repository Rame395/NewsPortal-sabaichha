import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission, sanitizePermissionList } from '@/lib/auth/permissions'
import { Role } from '@/lib/prisma'
import { sendRoleOrPasswordUpdateEmail } from '@/lib/email/mailer'

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

    const actorIsSuperAdmin = currentUser.role === Role.SUPER_ADMIN
    const isSelf = id === currentUser.id

    // SECURITY: Only a Super Admin may modify a Super Admin account (password, role, status, permissions).
    // Prevents an ADMIN with 'users:manage' from resetting the owner's password and taking over the site.
    if (targetUser.role === Role.SUPER_ADMIN && !actorIsSuperAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. Only a Super Admin can modify a Super Admin account.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { isActive, permissions, role, newPassword, sendNotificationEmail } = body

    // SECURITY: No self-escalation. Users cannot change their own role or permissions.
    if (isSelf && (role !== undefined || permissions !== undefined)) {
      return NextResponse.json(
        { error: 'You cannot change your own role or permissions. Ask another administrator.' },
        { status: 403 }
      )
    }

    const updateData: Record<string, unknown> = {}

    // 1. Status toggle
    if (typeof isActive === 'boolean') {
      if (isSelf && !isActive) {
        return NextResponse.json({ error: 'You cannot deactivate your own account.' }, { status: 400 })
      }
      updateData.isActive = isActive

      // If deactivated, kill all existing sessions immediately
      if (!isActive) {
        await prisma.session.deleteMany({ where: { userId: id } })
      }
    }

    // 2. Role update
    if (role !== undefined) {
      if (!Object.values(Role).includes(role as Role)) {
        return NextResponse.json({ error: 'Invalid role specified.' }, { status: 400 })
      }
      if (role === Role.SUPER_ADMIN && !actorIsSuperAdmin) {
        return NextResponse.json({ error: 'Only Super Admins can assign the Super Admin role.' }, { status: 403 })
      }
      updateData.role = role as Role
    }

    // 3. Permissions update (only known keys; non-super-admins can only grant what they themselves hold)
    if (permissions !== undefined) {
      const requested = sanitizePermissionList(permissions)
      const grantable = actorIsSuperAdmin
        ? requested
        : requested.filter((p) => currentUser.permissions.includes(p))
      if (grantable.length !== requested.length) {
        return NextResponse.json(
          { error: 'You cannot grant permissions that you do not hold yourself.' },
          { status: 403 }
        )
      }
      updateData.permissions = grantable
    }

    // 4. Password reset by admin
    if (newPassword !== undefined) {
      if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 200) {
        return NextResponse.json({ error: 'New password must be 8-200 characters long.' }, { status: 400 })
      }
      const salt = await bcrypt.genSalt(12)
      updateData.passwordHash = await bcrypt.hash(newPassword, salt)
      updateData.mustChangePassword = true
      // Revoke old sessions so they must log in with new password
      await prisma.session.deleteMany({ where: { userId: id } })
    }

    // Role or permission changes take effect immediately: revoke sessions of the target user
    if (updateData.role !== undefined || updateData.permissions !== undefined) {
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

    // If role or password changed, send notification email if enabled (default true)
    if ((role !== undefined || newPassword !== undefined) && sendNotificationEmail !== false) {
      sendRoleOrPasswordUpdateEmail({
        to: targetUser.email,
        fullName: targetUser.fullName,
        email: targetUser.email,
        role: role as string | undefined,
        newPassword: newPassword as string | undefined,
      }).catch((err) => console.error('Failed to send update email:', err))
    }

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
