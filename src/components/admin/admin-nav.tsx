'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useLanguage } from '@/context/language-context'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { hasPermission } from '@/lib/auth/permissions'
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Image as ImageIcon,
  MessageSquare,
  Users,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Shield,
  Settings as SettingsIcon,
  Megaphone,
  Mail,
} from 'lucide-react'

interface CurrentUser {
  id: string
  fullName: string
  email: string
  role: string
  permissions: string[]
  mustChangePassword: boolean
  isActive: boolean
  avatarUrl: string | null
  bio: string | null
}

export function AdminNav({
  currentUser,
  children,
}: {
  currentUser: CurrentUser | null
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { language } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [user, setUser] = React.useState<CurrentUser | null>(currentUser)

  React.useEffect(() => {
    if (currentUser) {
      setUser(currentUser)
    }
  }, [currentUser])

  // Safety net: if currentUser was null in layout (e.g. freshly signed in via client router), fetch session
  React.useEffect(() => {
    if (!user && pathname !== '/admin/login' && pathname !== '/admin/change-password') {
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data?.authenticated && data.user) {
            setUser(data.user)
          }
        })
        .catch(() => {})
    }
  }, [user, pathname])

  const activeUser = user || currentUser

  // Don't render the administrative sidebar on login or password change screens
  if (!activeUser || pathname === '/admin/login' || pathname === '/admin/change-password') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    window.location.href = '/admin/login'
  }

  const navItems = [
    {
      nameEn: 'Overview',
      nameNe: 'ड्यासबोर्ड',
      href: '/admin',
      icon: LayoutDashboard,
      allowed: true,
    },
    {
      nameEn: 'Articles',
      nameNe: 'समाचारहरू',
      href: '/admin/articles',
      icon: FileText,
      allowed: hasPermission(activeUser.role, activeUser.permissions, [
        'articles:create',
        'articles:edit_own',
        'articles:edit_all',
      ]),
    },
    {
      nameEn: 'Media Library',
      nameNe: 'मिडिया ग्यालरी',
      href: '/admin/media',
      icon: ImageIcon,
      allowed: hasPermission(activeUser.role, activeUser.permissions, [
        'media:upload',
        'articles:create',
        'articles:edit_own',
        'articles:edit_all',
      ]),
    },
    {
      nameEn: 'Categories',
      nameNe: 'विधाहरू',
      href: '/admin/categories',
      icon: FolderTree,
      allowed: hasPermission(activeUser.role, activeUser.permissions, 'categories:manage'),
    },
    {
      nameEn: 'Comments',
      nameNe: 'प्रतिक्रियाहरू',
      href: '/admin/comments',
      icon: MessageSquare,
      allowed: hasPermission(activeUser.role, activeUser.permissions, 'comments:moderate'),
    },
    {
      nameEn: 'Advertisements',
      nameNe: 'विज्ञापन व्यवस्थापन',
      href: '/admin/ads',
      icon: Megaphone,
      allowed: hasPermission(activeUser.role, activeUser.permissions, 'ads:manage'),
    },
    {
      nameEn: 'Newsletter',
      nameNe: 'इमेल बुलेटिन',
      href: '/admin/newsletter',
      icon: Mail,
      allowed: hasPermission(activeUser.role, activeUser.permissions, 'newsletter:manage'),
    },
    {
      nameEn: 'Staff & Roles',
      nameNe: 'कर्मचारी तथा भूमिका',
      href: '/admin/users',
      icon: Users,
      allowed: hasPermission(activeUser.role, activeUser.permissions, 'users:manage'),
    },
    {
      nameEn: 'Audit Logs',
      nameNe: 'सुरक्षा लगहरू',
      href: '/admin/audit',
      icon: ShieldAlert,
      allowed: hasPermission(activeUser.role, activeUser.permissions, 'audit:view'),
    },
    {
      nameEn: 'Site Settings',
      nameNe: 'साइट सेटिङ्स',
      href: '/admin/settings',
      icon: SettingsIcon,
      allowed: hasPermission(activeUser.role, activeUser.permissions, 'settings:manage'),
    },
  ]

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-400 border-red-300 dark:border-red-800',
    ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-400 border-purple-300 dark:border-purple-800',
    EDITOR: 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-400 border-blue-300 dark:border-blue-800',
    JOURNALIST: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
    MODERATOR: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400 border-amber-300 dark:border-amber-800',
    CUSTOM: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 justify-between">
        <div>
          {/* Brand header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="relative h-12 w-48 bg-white rounded-lg p-1 shadow-2xs">
                <Image src="/logo.jpg" alt="SabaiChha.com" fill className="object-contain" priority />
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems
              .filter((item) => item.allowed)
              .map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{language === 'ne' ? item.nameNe : item.nameEn}</span>
                  </Link>
                )
              })}
          </nav>
        </div>

        {/* User Card & Public Portal Link */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <span>{language === 'ne' ? 'मुख्य वेबसाइट हेर्नुहोस्' : 'Visit Live Website'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2">
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {activeUser.fullName}
              </p>
              <span
                className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                  roleColors[activeUser.role] || roleColors.CUSTOM
                }`}
              >
                {activeUser.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
              title="Sign Out / बाहिरिनुहोस्"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
              {language === 'ne' ? 'प्रशासन कक्ष' : 'Newsroom Control'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex">
            <div className="w-64 bg-white dark:bg-slate-900 h-full p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">SabaiChha.com</span>
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                <nav className="mt-4 space-y-1">
                  {navItems
                    .filter((item) => item.allowed)
                    .map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          prefetch={true}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                            isActive
                              ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{language === 'ne' ? item.nameNe : item.nameEn}</span>
                        </Link>
                      )
                    })}
                </nav>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2 px-3 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{language === 'ne' ? 'लगआउट' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
