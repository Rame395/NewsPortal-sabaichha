import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { AdminNav } from '@/components/admin/admin-nav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  // Note: /admin/login handles its own redirection, but for general admin pages we verify auth:
  // In server layout, child routes (like /admin/login) also render inside or can bypass if on login path.
  // To avoid circular redirect on /admin/login or /admin/change-password, we let AdminNav render contextually or render children directly if unauthenticated.
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      <AdminNav currentUser={user}>
        {children}
      </AdminNav>
    </div>
  )
}
