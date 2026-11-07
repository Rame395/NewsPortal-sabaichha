import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'
import { sanitizeArticleHtml, sanitizePlainText } from '@/lib/security/sanitizer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()

    if (
      !currentUser ||
      !hasPermission(currentUser.role, currentUser.permissions, [
        'articles:create',
        'articles:edit_own',
        'articles:edit_all',
        'breaking:manage',
      ])
    ) {
      return NextResponse.json(
        { error: 'Unauthorized to view live updates.' },
        { status: 403 }
      )
    }

    const { id } = await params

    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        isBreaking: true,
        authorId: true,
      },
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 })
    }

    const updates = await prisma.liveUpdate.findMany({
      where: { articleId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, fullName: true, email: true },
        },
      },
    })

    return NextResponse.json({
      article,
      updates,
    })
  } catch (error) {
    console.error('Failed to load live updates:', error)
    return NextResponse.json(
      { error: 'Failed to load live updates.' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()

    if (
      !currentUser ||
      !hasPermission(currentUser.role, currentUser.permissions, [
        'articles:create',
        'articles:edit_own',
        'articles:edit_all',
        'breaking:manage',
      ])
    ) {
      return NextResponse.json(
        { error: 'Unauthorized to post live updates.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { headline, content, markBreaking } = body

    const trimmedHeadline = typeof headline === 'string' ? headline.trim() : ''
    const trimmedContent = typeof content === 'string' ? content.trim() : ''

    if (trimmedHeadline.length < 3 || trimmedHeadline.length > 200) {
      return NextResponse.json(
        { error: 'Headline must be between 3 and 200 characters.' },
        { status: 400 }
      )
    }

    if (trimmedContent.length < 3 || trimmedContent.length > 5000) {
      return NextResponse.json(
        { error: 'Update content must be between 3 and 5000 characters.' },
        { status: 400 }
      )
    }

    const article = await prisma.article.findUnique({
      where: { id },
      select: { id: true, title: true, isBreaking: true, authorId: true },
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 })
    }

    // Author scoping: users without edit_all or breaking:manage can only post live updates on their own articles
    const canManageAny = hasPermission(currentUser.role, currentUser.permissions, [
      'articles:edit_all',
      'breaking:manage',
    ])
    if (!canManageAny && article.authorId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Forbidden. You can only post live updates on your own articles.' },
        { status: 403 }
      )
    }

    // Create sanitized live update
    const liveUpdate = await prisma.liveUpdate.create({
      data: {
        articleId: id,
        headline: sanitizePlainText(trimmedHeadline),
        content: sanitizeArticleHtml(trimmedContent),
        authorId: currentUser.id,
      },
      include: {
        author: {
          select: { id: true, fullName: true, email: true },
        },
      },
    })

    // Only users with breaking:manage or articles:publish can alter the article's breaking flag
    const canToggleBreaking = hasPermission(currentUser.role, currentUser.permissions, [
      'breaking:manage',
      'articles:publish',
    ])

    await prisma.article.update({
      where: { id },
      data: {
        ...(canToggleBreaking && {
          isBreaking: markBreaking !== undefined ? Boolean(markBreaking) : true,
        }),
        updatedAt: new Date(),
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'LIVE_UPDATE_POST',
        targetType: 'ARTICLE',
        targetId: id,
        details: `Posted live update: "${trimmedHeadline}" to "${article.title}"`,
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      liveUpdate,
      messageEn: 'Live update published successfully.',
      messageNe: 'प्रत्यक्ष अपडेट सफलतापूर्वक प्रकाशित गरियो।',
    })
  } catch (error) {
    console.error('Failed to post live update:', error)
    return NextResponse.json(
      { error: 'Failed to publish live update.' },
      { status: 500 }
    )
  }
}
