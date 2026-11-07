import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'
import { ArticleStatus } from '@/lib/prisma'
import { sanitizeArticleHtml, sanitizePlainText } from '@/lib/security/sanitizer'
import { safeHttpUrl } from '@/lib/security/url'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        author: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
        tags: {
          include: { tag: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 })
    }

    // Scoping: author or edit_all
    const canEditAll = hasPermission(currentUser.role, currentUser.permissions, 'articles:edit_all')
    if (article.authorId !== currentUser.id && !canEditAll) {
      return NextResponse.json({ error: 'Forbidden. You do not have permission to view this article.' }, { status: 403 })
    }

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Fetch single article error:', error)
    return NextResponse.json({ error: 'Failed to retrieve article.' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const article = await prisma.article.findUnique({ where: { id } })
    if (!article) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 })
    }

    const canEditAll = hasPermission(currentUser.role, currentUser.permissions, 'articles:edit_all')
    if (article.authorId !== currentUser.id && !canEditAll) {
      return NextResponse.json({ error: 'Forbidden. You cannot edit another author’s article.' }, { status: 403 })
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
      status,
      isBreaking,
      isFeatured,
      isTrending,
      isCategoryLead,
      scheduledFor,
      tags,
    } = body

    const updateData: Record<string, unknown> = {}

    if (title) updateData.title = sanitizePlainText(String(title))
    if (subtitle !== undefined) updateData.subtitle = subtitle ? sanitizePlainText(String(subtitle)) : null
    if (excerpt !== undefined) updateData.excerpt = excerpt ? sanitizePlainText(String(excerpt)) : null
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage ? safeHttpUrl(featuredImage) : null
    if (imageCaption !== undefined) updateData.imageCaption = imageCaption ? sanitizePlainText(String(imageCaption)) : null
    if (categoryId) updateData.categoryId = Number(categoryId)
    if (typeof isBreaking === 'boolean') updateData.isBreaking = isBreaking
    if (typeof isFeatured === 'boolean') updateData.isFeatured = isFeatured
    if (typeof isTrending === 'boolean') updateData.isTrending = isTrending
    if (typeof isCategoryLead === 'boolean') updateData.isCategoryLead = isCategoryLead

    if (content) {
      updateData.content = sanitizeArticleHtml(String(content))
      const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
      updateData.readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180))
    }

    if (slug) {
      const cleanSlug = String(slug)
        .toLowerCase()
        .trim()
        .replace(/[\u0964\u0965।,.;:!?"'“”‘’«»()\[\]{}–—/\\]/g, ' ')
        .replace(/[^a-z0-9\u0900-\u097F]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-+/g, '-')

      const existing = await prisma.article.findFirst({
        where: { slug: cleanSlug, NOT: { id } },
      })
      if (existing) {
        return NextResponse.json({ error: 'Slug is already used by another article.' }, { status: 400 })
      }
      updateData.slug = cleanSlug
    }

    // Status management
    if (status && Object.values(ArticleStatus).includes(status)) {
      const canPublish = hasPermission(currentUser.role, currentUser.permissions, 'articles:publish')

      if ((status === 'PUBLISHED' || status === 'SCHEDULED') && !canPublish) {
        return NextResponse.json({ error: 'Forbidden. You do not have permission to publish or schedule articles.' }, { status: 403 })
      }

      updateData.status = status
      if (status === 'PUBLISHED' && !article.publishedAt) {
        updateData.publishedAt = new Date()
      }
      if (status === 'SCHEDULED') {
        updateData.scheduledFor = scheduledFor ? new Date(scheduledFor) : null
      }
    }

    // Update tags if provided
    if (Array.isArray(tags)) {
      await prisma.articleTag.deleteMany({ where: { articleId: id } })
      if (tags.length > 0) {
        await prisma.articleTag.createMany({
          data: tags.map((t: { id: number }) => ({
            articleId: id,
            tagId: t.id,
          })),
        })
      }
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        author: { select: { fullName: true } },
      },
    })

    // Log the update
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'ARTICLE_UPDATED',
        targetType: 'Article',
        targetId: id,
        details: `Updated article "${updatedArticle.title}" (status: ${updatedArticle.status})`,
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Article updated successfully.',
      article: updatedArticle,
    })
  } catch (error) {
    console.error('Update article error:', error)
    return NextResponse.json({ error: 'Failed to update article.' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const article = await prisma.article.findUnique({ where: { id } })
    if (!article) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 })
    }

    const canDelete = hasPermission(currentUser.role, currentUser.permissions, 'articles:delete')
    const isAuthorDraft = article.authorId === currentUser.id && article.status === 'DRAFT'

    if (!canDelete && !isAuthorDraft) {
      return NextResponse.json({ error: 'Forbidden. You do not have permission to delete articles.' }, { status: 403 })
    }

    await prisma.article.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'ARTICLE_DELETED',
        targetType: 'Article',
        targetId: id,
        details: `Deleted article "${article.title}"`,
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Article deleted successfully.' })
  } catch (error) {
    console.error('Delete article error:', error)
    return NextResponse.json({ error: 'Failed to delete article.' }, { status: 500 })
  }
}
