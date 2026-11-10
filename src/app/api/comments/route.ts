import { NextRequest, NextResponse } from 'next/server'
import prisma, { ArticleStatus, CommentStatus } from '@/lib/prisma'
import { sanitizePlainText } from '@/lib/security/sanitizer'
import { checkRateLimit } from '@/lib/security/rate-limit'

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
    // 0. Rate limiting: Max 5 comments per 10 minutes per IP
    const rateLimitError = checkRateLimit(request, 'comment_submission', {
      maxRequests: 5,
      windowMs: 10 * 60 * 1000,
      messageEn: 'Too many comment submissions. Please wait a few minutes before submitting another comment.',
      messageNe: 'छोटो समयमा धेरै प्रतिक्रिया पठाइयो। कृपया केही मिनेटपछि पुन: प्रयास गर्नुहोस्।',
    })
    if (rateLimitError) return rateLimitError

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

    const trimmedName = typeof authorName === 'string' && authorName.trim() ? authorName.trim() : 'पाठक'
    const trimmedEmail = typeof authorEmail === 'string' && authorEmail.trim() ? authorEmail.trim() : 'reader@sabaichha.com'
    const trimmedContent = typeof content === 'string' ? content.trim() : ''

    if (trimmedContent.length < 2 || trimmedContent.length > 2000) {
      return NextResponse.json(
        { error: 'Comment must be between 2 and 2000 characters.' },
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

    // 5. Create comment in PENDING status for editorial moderation (Sanitized plain text)
    const comment = await prisma.comment.create({
      data: {
        articleId,
        authorName: sanitizePlainText(trimmedName),
        authorEmail: trimmedEmail,
        content: sanitizePlainText(trimmedContent),
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
