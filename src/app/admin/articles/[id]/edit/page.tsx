import { getCurrentUser } from '@/lib/auth/session'
import prisma from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { hasPermission } from '@/lib/auth/permissions'
import { ArticleForm } from '@/components/admin/article-form'

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/admin/login')
  }

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      tags: {
        include: { tag: true },
      },
    },
  })

  if (!article) {
    notFound()
  }

  // Scoping check
  const canEditAll = hasPermission(currentUser.role, currentUser.permissions, 'articles:edit_all')
  if (article.authorId !== currentUser.id && !canEditAll) {
    redirect('/admin/articles')
  }

  const initialData = {
    id: article.id,
    title: article.title,
    slug: article.slug,
    subtitle: article.subtitle,
    content: article.content,
    excerpt: article.excerpt,
    featuredImage: article.featuredImage,
    imageCaption: article.imageCaption,
    categoryId: article.categoryId,
    status: article.status,
    isBreaking: article.isBreaking,
    isFeatured: article.isFeatured,
    scheduledFor: article.scheduledFor ? article.scheduledFor.toISOString() : null,
    tags: article.tags,
  }

  return <ArticleForm initialData={initialData} />
}
