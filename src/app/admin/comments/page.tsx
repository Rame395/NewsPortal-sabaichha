import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'
import { CommentModerator } from '@/components/admin/comment-moderator'

export const dynamic = 'force-dynamic'

export default async function AdminCommentsPage() {
  const currentUser = await getCurrentUser()

  if (
    !currentUser ||
    !hasPermission(currentUser.role, currentUser.permissions, 'comments:moderate')
  ) {
    redirect('/admin')
  }

  return <CommentModerator />
}
