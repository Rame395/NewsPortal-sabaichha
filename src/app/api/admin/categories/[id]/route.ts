import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const categoryId = parseInt(id, 10)

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID.' }, { status: 400 })
    }

    const currentUser = await getCurrentUser()
    if (!currentUser || !hasPermission(currentUser.role, currentUser.permissions, 'categories:manage')) {
      return NextResponse.json({ error: 'Forbidden. Permission denied.' }, { status: 403 })
    }

    const body = await request.json()
    const { nameEn, nameNe, slug, description, parentId, orderIndex, showInMenu, layoutStyle } = body

    const updateData: Record<string, unknown> = {}

    if (nameEn) updateData.nameEn = String(nameEn).trim()
    if (nameNe) updateData.nameNe = String(nameNe).trim()
    if (slug) {
      const cleanSlug = String(slug)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      const existing = await prisma.category.findFirst({
        where: { slug: cleanSlug, NOT: { id: categoryId } },
      })
      if (existing) {
        return NextResponse.json({ error: 'Slug is already in use by another category.' }, { status: 400 })
      }
      updateData.slug = cleanSlug
    }
    if (description !== undefined) updateData.description = description ? String(description).trim() : null
    if (parentId !== undefined) updateData.parentId = parentId ? Number(parentId) : null
    if (orderIndex !== undefined) updateData.orderIndex = Number(orderIndex)
    if (showInMenu !== undefined) updateData.showInMenu = Boolean(showInMenu)
    if (layoutStyle !== undefined) updateData.layoutStyle = String(layoutStyle)

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
    })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'CATEGORY_UPDATED',
        targetType: 'Category',
        targetId: String(categoryId),
        details: `Updated category #${categoryId}: ${Object.keys(updateData).join(', ')}`,
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, category: updated })
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json({ error: 'Failed to update category.' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const categoryId = parseInt(id, 10)

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID.' }, { status: 400 })
    }

    const currentUser = await getCurrentUser()
    if (!currentUser || !hasPermission(currentUser.role, currentUser.permissions, 'categories:manage')) {
      return NextResponse.json({ error: 'Forbidden. Permission denied.' }, { status: 403 })
    }

    // Check if category has articles
    const articleCount = await prisma.article.count({ where: { categoryId } })
    if (articleCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. It currently contains ${articleCount} news articles. Please reassign or delete the articles first.` },
        { status: 400 }
      )
    }

    await prisma.category.delete({ where: { id: categoryId } })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'CATEGORY_DELETED',
        targetType: 'Category',
        targetId: String(categoryId),
        details: `Deleted category #${categoryId}`,
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Category deleted successfully.' })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json({ error: 'Failed to delete category.' }, { status: 500 })
  }
}
