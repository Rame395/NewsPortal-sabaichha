import { NextRequest, NextResponse } from 'next/server'
import prisma, { ArticleStatus, CommentStatus } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required.' }, { status: 400 })
    }

    // Fetch all approved comments for this article
    const comments = await prisma.comment.findMany({
      where: {
        articleId,
        status: CommentStatus.APPROVED,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        authorName: true,
        content: true,
        parentId: true,
        createdAt: true,
      },
    })

    // Separate top-level comments and replies
    const topLevel = comments.filter((c) => !c.parentId)
    const replies = comments.filter((c) => c.parentId)

    // Nest replies under top-level comments
    const structuredComments = topLevel.map((parent) => ({
      ...parent,
      replies: replies.filter((r) => r.parentId === parent.id),
    }))

    return NextResponse.json({
      comments: structuredComments,
      totalCount: comments.length,
    })
  } catch (error) {
    console.error('Failed to load comments:', error)
    return NextResponse.json({ error: 'Failed to load comments.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { articleId, authorName, authorEmail, content, parentId, honeypot } = body

    // 1. Anti-spam honeypot detection
    if (honeypot && String(honeypot).trim().length > 0) {
      // Bot detected, silently return success without persisting
      return NextResponse.json({
        success: true,
        messageEn: 'Your comment has been submitted and is awaiting editorial moderation.',
        messageNe: 'तपाईंको प्रतिक्रिया दर्ता भयो। सम्पादकीय स्वीकृतिपछि प्रकाशित हुनेछ।',
      })
    }

    // 2. Validate input fields
    if (!articleId || typeof articleId !== 'string') {
      return NextResponse.json({ error: 'Invalid article ID.' }, { status: 400 })
    }

    const trimmedName = typeof authorName === 'string' ? authorName.trim() : ''
    const trimmedEmail = typeof authorEmail === 'string' ? authorEmail.trim() : ''
    const trimmedContent = typeof content === 'string' ? content.trim() : ''

    if (trimmedName.length < 2 || trimmedName.length > 80) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 80 characters.' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    if (trimmedContent.length < 3 || trimmedContent.length > 2000) {
      return NextResponse.json(
        { error: 'Comment must be between 3 and 2000 characters.' },
        { status: 400 }
      )
    }

    // 3. Verify article exists and is published
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, status: true },
    })

    if (!article || article.status !== ArticleStatus.PUBLISHED) {
      return NextResponse.json(
        { error: 'Article not found or not published.' },
        { status: 404 }
      )
    }

    // 4. If parentId is provided, verify it belongs to this article
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, articleId: true },
      })
      if (!parentComment || parentComment.articleId !== articleId) {
        return NextResponse.json(
          { error: 'Parent comment does not belong to this article.' },
          { status: 400 }
        )
      }
    }

    // 5. Create comment in PENDING status for editorial moderation
    const comment = await prisma.comment.create({
      data: {
        articleId,
        authorName: trimmedName,
        authorEmail: trimmedEmail,
        content: trimmedContent,
        parentId: parentId || null,
        status: CommentStatus.PENDING,
      },
    })

    return NextResponse.json(
      {
        success: true,
        commentId: comment.id,
        messageEn: 'Your comment has been submitted and is awaiting editorial moderation.',
        messageNe: 'तपाईंको प्रतिक्रिया दर्ता भयो। सम्पादकीय स्वीकृतिपछि प्रकाशित हुनेछ।',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to submit comment:', error)
    return NextResponse.json(
      { error: 'Failed to submit comment. Please try again.' },
      { status: 500 }
    )
  }
}
