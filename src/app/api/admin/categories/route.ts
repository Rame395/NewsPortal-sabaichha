import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        parent: {
          select: { id: true, nameEn: true, nameNe: true },
        },
        children: {
          select: { id: true, nameEn: true, nameNe: true, slug: true, orderIndex: true },
        },
        _count: {
          select: { articles: true },
        },
      },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Fetch categories error:', error)
    return NextResponse.json({ error: 'Failed to fetch categories.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || !hasPermission(currentUser.role, currentUser.permissions, 'categories:manage')) {
      return NextResponse.json({ error: 'Forbidden. You do not have permission to manage categories.' }, { status: 403 })
    }

    const body = await request.json()
    const { nameEn, nameNe, slug, description, parentId, orderIndex, showInMenu, layoutStyle } = body

    if (!nameEn || !nameNe) {
      return NextResponse.json({ error: 'Both English and Nepali category names are required.' }, { status: 400 })
    }

    const cleanSlug = (slug || nameEn)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Check slug uniqueness
    const existing = await prisma.category.findUnique({ where: { slug: cleanSlug } })
    if (existing) {
      return NextResponse.json({ error: 'A category with this slug already exists.' }, { status: 400 })
    }

    const newCategory = await prisma.category.create({
      data: {
        nameEn: String(nameEn).trim(),
        nameNe: String(nameNe).trim(),
        slug: cleanSlug,
        description: description ? String(description).trim() : null,
        parentId: parentId ? Number(parentId) : null,
        orderIndex: orderIndex ? Number(orderIndex) : 0,
        showInMenu: showInMenu !== false,
        layoutStyle: layoutStyle ? String(layoutStyle) : 'HERO_LIST',
      },
    })

    // Log the category creation
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'CATEGORY_CREATED',
        targetType: 'Category',
        targetId: String(newCategory.id),
        details: `Created category ${newCategory.nameEn} / ${newCategory.nameNe} (${newCategory.slug})`,
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Category created successfully.',
      category: newCategory,
    })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json({ error: 'Failed to create category.' }, { status: 500 })
  }
}
