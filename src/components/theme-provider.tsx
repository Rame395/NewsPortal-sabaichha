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
  const [theme, setThemeState] = React.useState<Theme>('light')
  const [resolvedTheme, setResolvedTheme] = React.useState<Theme>('light')

  const applyClass = (t: Theme) => {
    if (typeof document === 'undefined') return
    if (t === 'dark') {
      document.documentElement.classList.add('dark')
      if (document.body) {
        document.body.classList.add('dark')
      }
    } else {
      document.documentElement.classList.remove('dark')
      if (document.body) {
        document.body.classList.remove('dark')
      }
    }
  }

  React.useEffect(() => {
    const saved = (localStorage.getItem('sabaichha_theme') as Theme) || (defaultTheme === 'dark' ? 'dark' : 'light')
    setThemeState(saved)
    setResolvedTheme(saved)
    applyClass(saved)
  }, [defaultTheme])

  const setTheme = (newTheme: Theme | string) => {
    const valid: Theme = newTheme === 'dark' ? 'dark' : 'light'
    setThemeState(valid)
    setResolvedTheme(valid)
    try {
      localStorage.setItem('sabaichha_theme', valid)
    } catch {}
    applyClass(valid)
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
