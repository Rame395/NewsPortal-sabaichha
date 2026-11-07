'use client'

import * as React from 'react'

export type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: Theme
  setTheme: (theme: Theme | string) => void
  toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = 'light',
}: {
  children: React.ReactNode
  defaultTheme?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sabaichha_theme') as Theme
        if (saved === 'dark' || saved === 'light') return saved
        if (document.documentElement.classList.contains('dark')) return 'dark'
      } catch {}
    }
    return defaultTheme === 'dark' ? 'dark' : 'light'
  })

  const [resolvedTheme, setResolvedTheme] = React.useState<Theme>(theme)

  const applyTheme = (t: Theme) => {
    if (typeof document === 'undefined') return
    if (t === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.style.colorScheme = 'dark'
      if (document.body) document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
      if (document.body) document.body.classList.remove('dark')
    }
  }

  // Ensure theme is applied on initial mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('sabaichha_theme') as Theme
      const active = saved === 'dark' || saved === 'light' ? saved : defaultTheme === 'dark' ? 'dark' : 'light'
      setThemeState(active)
      setResolvedTheme(active)
      applyTheme(active)
    } catch {}
  }, [defaultTheme])

  const setTheme = (newTheme: Theme | string) => {
    const valid: Theme = newTheme === 'dark' ? 'dark' : 'light'
    setThemeState(valid)
    setResolvedTheme(valid)
    try {
      localStorage.setItem('sabaichha_theme', valid)
      // Also store cookie so server knows if needed
      document.cookie = `sabaichha_theme=${valid}; path=/; max-age=31536000; SameSite=Lax`
    } catch {}
    applyTheme(valid)
  }

  const toggleTheme = () => {
    const next: Theme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    return {
      theme: 'light' as Theme,
      resolvedTheme: 'light' as Theme,
      setTheme: () => {},
      toggleTheme: () => {},
    }
  }
  return context
}
