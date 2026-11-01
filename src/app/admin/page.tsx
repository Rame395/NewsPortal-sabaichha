import { getCurrentUser } from '@/lib/auth/session'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, FolderTree, FileText, Shield, ArrowRight, Activity, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/admin/login')
  }

  if (currentUser.mustChangePassword) {
    redirect('/admin/change-password')
  }

  // Fetch quick metrics from local PostgreSQL
  const [userCount, categoryCount, articleCount, recentLogs] = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.article.count(),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { fullName: true, email: true, role: true },
        },
      },
    }),
  ])

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 border border-white/30 tracking-wide uppercase">
            SabaiChha.com Newsroom
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-3">
            Welcome back, {currentUser.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-red-100 mt-1 max-w-xl">
            You are authorized as <span className="font-bold underline">{currentUser.role}</span> with{' '}
            {currentUser.permissions.length} granular feature capabilities enabled.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Staff Members
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{userCount}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Categories
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{categoryCount}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FolderTree className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Articles
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{articleCount}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Permissions Breakdown & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Your Granted Capabilities
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Role: {currentUser.role}
            </span>
          </div>

          <div className="pt-4 flex flex-wrap gap-2">
            {currentUser.role === 'SUPER_ADMIN' ? (
              <div className="w-full p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300">
                <span className="font-bold">Full Platform Authority:</span> As Super Administrator, you have unrestricted access to all editorial controls, database management, and staff roles.
              </div>
            ) : currentUser.permissions.length > 0 ? (
              currentUser.permissions.map((p) => (
                <span
                  key={p}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  ✓ {p}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No custom permissions assigned.</p>
            )}
          </div>
        </div>

        {/* Recent Audit Activity */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity</h2>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No audit records logged yet.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="text-xs border-b border-slate-100 dark:border-slate-800 pb-2 last:border-none">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{log.action}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5 truncate">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
