import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'
import { MediaManager } from '@/components/admin/media-manager'

export const dynamic = 'force-dynamic'

export default async function AdminMediaPage() {
  const currentUser = await getCurrentUser()

  if (
    !currentUser ||
    !hasPermission(currentUser.role, currentUser.permissions, [
      'media:upload',
      'articles:create',
      'articles:edit_own',
      'articles:edit_all',
    ])
  ) {
    redirect('/admin')
  }

  const [total, mediaItems] = await Promise.all([
    prisma.media.count(),
    prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
      take: 48,
      include: {
        uploader: {
          select: { id: true, fullName: true, email: true },
        },
      },
    }),
  ])

  // Serialize dates
  const serialized = mediaItems.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }))

  return <MediaManager initialMedia={serialized} initialTotal={total} />
}
