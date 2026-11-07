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
      {/* Unified Single-Click Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-2xs hover:border-red-500/60 transition cursor-pointer select-none text-[10px] sm:text-[11px] font-bold text-slate-800 dark:text-slate-100 hover:text-red-600 dark:hover:text-red-400"
        title="Choose website language / भाषा छान्नुहोस्"
        aria-label="Language selection"
        aria-expanded={isOpen}
      >
        <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600 dark:text-red-400 shrink-0" />
        <span suppressHydrationWarning>{currentDisplay}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-red-600' : ''
          }`}
        />
      </button>

      {/* Floating Language Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-red-500" />
              <span>भाषा छान्नुहोस्</span>
            </span>
            <span className="text-[9px] bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-extrabold uppercase">
              Instant
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto py-1 scrollbar-none">
            {LANGUAGES.map((lang) => {
              const isSelected = activeLang === lang.code
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-red-50/60 dark:hover:bg-slate-800/80 transition cursor-pointer ${
                    isSelected
                      ? 'text-red-600 dark:text-red-400 font-extrabold bg-red-50/70 dark:bg-red-950/30'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-sm">{lang.flag}</span>
                    <span className="font-semibold">{lang.name}</span>
                    {lang.code !== 'ne' && lang.code !== 'en' && (
                      <span className="text-[10px] text-slate-400">({lang.englishName})</span>
                    )}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
