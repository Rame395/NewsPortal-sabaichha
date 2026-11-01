import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'
import { getSiteSettings } from '@/lib/settings'
import { SettingsManager } from '@/components/admin/settings-manager'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const currentUser = await getCurrentUser()

  if (
    !currentUser ||
    !hasPermission(currentUser.role, currentUser.permissions, 'settings:manage')
  ) {
    redirect('/admin')
  }

  const initialSettings = await getSiteSettings()

  return <SettingsManager initialSettings={initialSettings} />
}
