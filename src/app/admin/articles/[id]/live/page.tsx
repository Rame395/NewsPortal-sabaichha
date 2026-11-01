import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'
import { LiveCoverageManager } from '@/components/admin/live-coverage-manager'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminArticleLivePage({ params }: PageProps) {
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
    redirect('/admin')
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
    notFound()
  }

  // If user only has edit_own, ensure they authored it
  if (
    !hasPermission(currentUser.role, currentUser.permissions, ['articles:edit_all', 'breaking:manage']) &&
    article.authorId !== currentUser.id
  ) {
    redirect('/admin/articles')
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

  const serializedUpdates = updates.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }))

  return (
    <LiveCoverageManager
      article={article}
      initialUpdates={serializedUpdates}
    />
  )
}
