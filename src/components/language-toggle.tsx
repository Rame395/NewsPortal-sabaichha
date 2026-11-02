'use client'

import * as React from 'react'
import { useLanguage } from '@/context/language-context'
import { changeGoogleTranslateLanguage } from '@/components/google-translator'
import { Globe, ChevronDown, Check, Sparkles } from 'lucide-react'

const LANGUAGES = [
  { code: 'ne', name: 'नेपाली', englishName: 'Nepali', flag: '🇳🇵' },
  { code: 'en', name: 'English', englishName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi', flag: '🇮🇳' },
  { code: 'zh-CN', name: '中文', englishName: 'Chinese', flag: '🇨🇳' },
  { code: 'es', name: 'Español', englishName: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', englishName: 'French', flag: '🇫🇷' },
  { code: 'ja', name: '日本語', englishName: 'Japanese', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', englishName: 'Arabic', flag: '🇸🇦' },
]

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()
  const [mounted, setMounted] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const [activeLang, setActiveLang] = React.useState<string>('ne')
  const dropdownRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    setMounted(true)
    setActiveLang(language)
  }, [language])

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  // Quick 1-click toggle between Nepali and English
  const handleQuickToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const nextLang = activeLang === 'ne' ? 'en' : 'ne'
    setActiveLang(nextLang)
    setLanguage(nextLang)
    changeGoogleTranslateLanguage(nextLang)
  }

  // Select language from dropdown
  const handleSelectLanguage = (code: string) => {
    setActiveLang(code)
    if (code === 'en' || code === 'ne') {
      setLanguage(code)
    }
    changeGoogleTranslateLanguage(code)
    setIsOpen(false)
  }

  const currentDisplay = mounted
    ? activeLang === 'ne'
      ? 'नेपाली (NE)'
      : activeLang === 'en'
      ? 'English (EN)'
      : activeLang.toUpperCase()
    : 'नेपाली (NE)'

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div className="inline-flex items-center rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-2xs hover:border-red-500/50 transition">
        {/* Main 1-click toggle button */}
        <button
          type="button"
          onClick={handleQuickToggle}
          className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-[11px] font-semibold text-slate-800 dark:text-slate-100 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
          title="Click to switch Nepali / English (Google Translate)"
          aria-label="Toggle language"
          suppressHydrationWarning
        >
          <Globe className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
          <span suppressHydrationWarning>{currentDisplay}</span>
        </button>

        {/* Dropdown arrow for other languages */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="pr-2 pl-0.5 py-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer border-l border-slate-200 dark:border-slate-700"
          title="More languages (Google Translate)"
          aria-label="Select language from list"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Language Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-red-500" />
              <span>Google Translate</span>
            </span>
            <span className="text-[9px] bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-1.5 py-0.2 rounded font-bold">
              Instant
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto py-1 scrollbar-none">
            {LANGUAGES.map((lang) => {
              const isSelected = activeLang === lang.code
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer ${
                    isSelected
                      ? 'text-red-600 dark:text-red-400 font-bold bg-red-50/50 dark:bg-red-950/20'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                    {lang.code !== 'ne' && lang.code !== 'en' && (
                      <span className="text-[10px] text-slate-400">({lang.englishName})</span>
                    )}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-red-600" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
