'use client'

import * as React from 'react'
import { useTheme } from '@/components/theme-provider'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-1.5 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
      aria-label="Toggle theme"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      suppressHydrationWarning
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5 text-amber-500" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" />
      )}
    </button>
  )
}
