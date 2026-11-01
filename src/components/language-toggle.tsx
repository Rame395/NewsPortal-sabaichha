'use client'

import * as React from 'react'
import { useLanguage } from '@/context/language-context'
import { Globe } from 'lucide-react'

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-16 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
      aria-label="Toggle language"
      title="Switch Language / भाषा परिवर्तन गर्नुहोस्"
    >
      <Globe className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
      <span>{language === 'ne' ? 'नेपाली (NE)' : 'English (EN)'}</span>
    </button>
  )
}
