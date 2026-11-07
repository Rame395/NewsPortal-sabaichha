import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'
import { sanitizePlainText } from '@/lib/security/sanitizer'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    })
    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Fetch tags error:', error)
    return NextResponse.json({ error: 'Failed to fetch tags.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (
      !currentUser ||
      !hasPermission(currentUser.role, currentUser.permissions, [
        'categories:manage',
        'articles:create',
        'articles:edit_own',
        'articles:edit_all',
      ])
    ) {
      return NextResponse.json({ error: 'Forbidden. You do not have permission to create tags.' }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug } = body

    const cleanName = typeof name === 'string' ? sanitizePlainText(name) : ''
    if (!cleanName || cleanName.length > 80) {
      return NextResponse.json({ error: 'Tag name is required (max 80 characters).' }, { status: 400 })
    }

    const cleanSlug = (slug || cleanName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0900-\u097F]+/g, '-')
      .replace(/^-+|-+$/g, '')

    if (!cleanSlug) {
      return NextResponse.json({ error: 'Invalid tag slug.' }, { status: 400 })
    }

    const tag = await prisma.tag.upsert({
      where: { slug: cleanSlug },
      update: { name: cleanName },
      create: { name: cleanName, slug: cleanSlug },
    })

    return NextResponse.json({ success: true, tag })
  } catch (error) {
    console.error('Create tag error:', error)
    return NextResponse.json({ error: 'Failed to create tag.' }, { status: 500 })
  }
}
