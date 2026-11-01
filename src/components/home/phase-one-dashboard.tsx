'use client'

import * as React from 'react'
import { Header } from '@/components/layout/header'
import { useLanguage } from '@/context/language-context'
import { CheckCircle2, Database, Globe, Moon, Layers, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface CategoryItem {
  id: number
  nameEn: string
  nameNe: string
  slug: string
}

export function PhaseOneDashboard({
  categories,
}: {
  categories: CategoryItem[]
}) {
  const { language, t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-10">
        {/* Phase 1 Verification Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {language === 'ne' ? 'चरण १: परियोजना सेटअप र डेटाबेस सफल' : 'Phase 1: Project Setup & Database Verified'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {language === 'ne' ? 'सबै छ डट कम डिजिटल समाचार पोर्टल' : 'SabaiChha.com - Full-Stack Digital News Portal'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {language === 'ne'
                  ? 'आधुनिक पूर्ण-स्ट्याक आर्किटेक्चर, द्विभाषी प्रणाली (नेपाली / अंग्रेजी), डार्क तथा लाइट मोड, र स्थानीय पोस्टग्रेस डेटाबेससँग सफलतापूर्वक जडान भएको छ।'
                  : 'Modern unified full-stack architecture initialized with bilingual support (Nepali / English), dark & light mode toggles, and local PostgreSQL database sync.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Next.js 16 + React 19 + Prisma
              </span>
            </div>
          </div>

          {/* Live Database Categories Verification */}
          <div className="py-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-600 dark:text-red-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {language === 'ne' ? 'स्थानीय पोस्टग्रेस डेटाबेसबाट लोड गरिएका विधाहरू' : 'Categories Loaded from Local PostgreSQL'}
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {categories.length} {language === 'ne' ? 'विधाहरू फेला परे' : 'categories found'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:border-red-500/50 transition group"
                >
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                    {language === 'ne' ? cat.nameNe : cat.nameEn}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-1">
                    /{cat.slug}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 1 Verification Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
                <Globe className="w-4 h-4 text-red-500" />
                <span>{language === 'ne' ? 'द्विभाषी अनुवाद इन्जिन' : 'Bilingual Engine'}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {language === 'ne'
                  ? 'माथिको हेडरमा रहेको भाषा बटन क्लिक गरी तुरुन्त नेपाली र अंग्रेजी बीच स्विच गर्न सकिन्छ।'
                  : 'Click the language toggle in the header above to switch seamlessly between Nepali and English.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
                <Moon className="w-4 h-4 text-amber-500" />
                <span>{language === 'ne' ? 'डार्क र लाइट मोड' : 'Light / Dark Theme'}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {language === 'ne'
                  ? 'सिस्टम प्राथमिकता वा म्यानुअल क्लिकद्वारा डार्क र लाइट थिम बदल्न सकिन्छ।'
                  : 'Toggle the theme anytime via the header icon with full local persistence across sessions.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
                <Database className="w-4 h-4 text-blue-500" />
                <span>{language === 'ne' ? 'पोस्टग्रेस स्कीमा र प्रिज्मा' : 'Local PostgreSQL + Prisma'}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {language === 'ne'
                  ? 'news_portal डेटाबेससँग तालिका र सिडिङ सफलतापूर्वक सम्पन्न भएको छ।'
                  : 'Tables (users, categories, articles, tags, comments) mapped and populated with test seeds.'}
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950">
        <p>© 2026 {language === 'ne' ? 'सबै छ डट कम' : 'SabaiChha.com'}. All rights reserved.</p>
      </footer>
    </div>
  )
}
