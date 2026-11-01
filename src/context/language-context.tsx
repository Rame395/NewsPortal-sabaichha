'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Language = 'ne' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: string) => string
}

const translations: Record<string, { ne: string; en: string }> = {
  // Navigation
  home: { ne: 'गृहपृष्ठ', en: 'Home' },
  politics: { ne: 'राजनीति', en: 'Politics' },
  society: { ne: 'समाज', en: 'Society' },
  economy: { ne: 'अर्थ', en: 'Economy' },
  opinion: { ne: 'विचार', en: 'Opinion' },
  sports: { ne: 'खेलकुद', en: 'Sports' },
  video: { ne: 'भिडियो', en: 'Video' },
  
  // Header / Utility
  breaking: { ne: 'ताजा अपडेट', en: 'Breaking' },
  trending: { ne: 'चर्चामा', en: 'Trending' },
  searchPlaceholder: { ne: 'समाचार खोज्नुहोस्...', en: 'Search news...' },
  nepaliCalendar: { ne: 'नेपाली पात्रो', en: 'Nepali Calendar' },
  weather: { ne: 'मौसम', en: 'Weather' },
  goldSilver: { ne: 'सुन-चाँदी', en: 'Gold & Silver' },
  forex: { ne: 'विदेशी मुद्रा', en: 'Forex' },
  
  // Theme & Settings
  lightMode: { ne: 'लाइट मोड', en: 'Light Mode' },
  darkMode: { ne: 'डार्क मोड', en: 'Dark Mode' },
  readTime: { ne: 'मिनेट पढ्न', en: 'min read' },
  latestNews: { ne: 'पछिल्लो समाचार', en: 'Latest News' },
  featuredStories: { ne: 'प्रमुख समाचार', en: 'Featured Stories' },
  
  // System
  dashboard: { ne: 'ड्यासबोर्ड', en: 'Dashboard' },
  login: { ne: 'लगइन', en: 'Login' },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ne')

  useEffect(() => {
    const saved = localStorage.getItem('news_portal_lang') as Language
    if (saved === 'ne' || saved === 'en') {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('news_portal_lang', lang)
  }

  const toggleLanguage = () => {
    setLanguage(language === 'ne' ? 'en' : 'ne')
  }

  const t = (key: string): string => {
    const entry = translations[key]
    if (!entry) return key
    return entry[language] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
