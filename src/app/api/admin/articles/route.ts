import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'
import { ArticleStatus } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (
      !currentUser ||
      !hasPermission(currentUser.role, currentUser.permissions, [
        'articles:create',
        'articles:edit_own',
        'articles:edit_all',
      ])
    ) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const status = searchParams.get('status') as ArticleStatus | null
    const categoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!, 10) : null
    const search = searchParams.get('search')?.trim()

    const where: Record<string, unknown> = {}

    // Authorship scoping: if user only has 'articles:edit_own', filter to their own articles
    const canEditAll = hasPermission(currentUser.role, currentUser.permissions, 'articles:edit_all')
    if (!canEditAll) {
      where.authorId = currentUser.id
    }

    if (status && Object.values(ArticleStatus).includes(status)) {
      where.status = status
    }

    if (categoryId && !isNaN(categoryId)) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subtitle: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, fullName: true, email: true, avatarUrl: true },
          },
          category: {
            select: { id: true, nameEn: true, nameNe: true, slug: true },
          },
          tags: {
            include: { tag: true },
          },
          _count: {
            select: { comments: true },
          },
        },
      }),
      prisma.article.count({ where }),
    ])

    return NextResponse.json({
      articles,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error('Fetch articles error:', error)
    return NextResponse.json({ error: 'Failed to retrieve articles.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || !hasPermission(currentUser.role, currentUser.permissions, 'articles:create')) {
      return NextResponse.json({ error: 'Forbidden. You do not have permission to write articles.' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      subtitle,
      content,
      excerpt,
      featuredImage,
      imageCaption,
      categoryId,
      status = 'DRAFT',
      isBreaking = false,
      isFeatured = false,
      scheduledFor,
      tags = [],
    } = body

    if (!title || !content || !categoryId) {
      return NextResponse.json({ error: 'Article headline, content, and category are required.' }, { status: 400 })
    }

    const canPublish = hasPermission(currentUser.role, currentUser.permissions, 'articles:publish')
    let finalStatus: ArticleStatus = status

    // If author doesn't have publish capability, prevent setting PUBLISHED or SCHEDULED
    if (!canPublish && (status === 'PUBLISHED' || status === 'SCHEDULED')) {
      finalStatus = 'REVIEW'
    }

    // Generate clean unique slug
    let cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0900-\u097F]+/g, '-')
      .replace(/^-+|-+$/g, '')

    if (!cleanSlug) {
      cleanSlug = `article-${Date.now()}`
    }

    // Ensure uniqueness
    const existing = await prisma.article.findUnique({ where: { slug: cleanSlug } })
    if (existing) {
      cleanSlug = `${cleanSlug}-${Math.floor(1000 + Math.random() * 9000)}`
    }

    // Calculate approximate read time (200 words / minute)
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180))

    const newArticle = await prisma.article.create({
      data: {
        title: String(title).trim(),
        slug: cleanSlug,
        subtitle: subtitle ? String(subtitle).trim() : null,
        content: String(content),
        excerpt: excerpt ? String(excerpt).trim() : null,
        featuredImage: featuredImage || null,
        imageCaption: imageCaption || null,
        status: finalStatus,
        isBreaking: Boolean(isBreaking),
        isFeatured: Boolean(isFeatured),
        readTimeMinutes,
        authorId: currentUser.id,
        categoryId: Number(categoryId),
        publishedAt: finalStatus === 'PUBLISHED' ? new Date() : null,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        tags: {
          create: Array.isArray(tags)
            ? tags.map((t: { id: number }) => ({
                tag: { connect: { id: t.id } },
              }))
            : [],
        },
      },
      include: {
        category: true,
        author: { select: { fullName: true } },
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'ARTICLE_CREATED',
        targetType: 'Article',
        targetId: newArticle.id,
        details: `Created article "${newArticle.title}" with status ${newArticle.status}`,
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Article created successfully.',
      article: newArticle,
    })
  } catch (error) {
    console.error('Create article error:', error)
    return NextResponse.json({ error: 'Failed to create article.' }, { status: 500 })
  }
}
