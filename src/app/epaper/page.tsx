'use client'

export const dynamic = 'force-dynamic'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useLanguage } from '@/context/language-context'
import { formatBikramSambat } from '@/lib/date/nepali-calendar'
import {
  Newspaper,
  Calendar,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Share2,
  Printer,
  Sparkles,
  BookOpen,
} from 'lucide-react'

const EPAPER_PAGES = [
  {
    pageNumber: 1,
    titleNe: 'पृष्ठ १: मुख्य समाचार (Front Page)',
    titleEn: 'Page 1: Front Page & Headlines',
    image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    descriptionNe: 'राष्ट्रिय राजनीतिक तथा आर्थिक घटनाक्रमहरूको मुख्य कभरेज',
    descriptionEn: 'Lead national developments, policy actions, and breaking headlines',
  },
  {
    pageNumber: 2,
    titleNe: 'पृष्ठ २: राजनीति र संसद् (Politics & Parliament)',
    titleEn: 'Page 2: Politics & Parliament',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    descriptionNe: 'मन्त्रिपरिषद्का निर्णय, संसदीय बहस र दलगत गतिविधि',
    descriptionEn: 'Cabinet decrees, parliamentary deliberations, and political analyses',
  },
  {
    pageNumber: 3,
    titleNe: 'पृष्ठ ३: विचार र सम्पादकीय (Editorial & Opinions)',
    titleEn: 'Page 3: Editorial & Opinions',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    descriptionNe: 'प्रधान सम्पादकको दृष्टिकोण, विश्लेषकहरूको लेख र स्तम्भ',
    descriptionEn: 'Editor-in-chief perspectives, guest columns, and thought leadership',
  },
  {
    pageNumber: 4,
    titleNe: 'पृष्ठ ४: अर्थतन्त्र र बजार (Economy & Markets)',
    titleEn: 'Page 4: Economy & Markets',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
    descriptionNe: 'नेप्से सेयर बजार, जलविद्युत् व्यापार, राजस्व र सुनचाँदी दर',
    descriptionEn: 'NEPSE equities, energy trade, bullion, and macro fiscal updates',
  },
  {
    pageNumber: 5,
    titleNe: 'पृष्ठ ५: खेलकुद (Sports)',
    titleEn: 'Page 5: Sports',
    image: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=1200&q=80',
    descriptionNe: 'नेपाली क्रिकेट, फुटबल र अन्तर्राष्ट्रिय खेलकूदको विश्लेषण',
    descriptionEn: 'Nepali cricket triumphs, football league, and global athletics',
  },
  {
    pageNumber: 6,
    titleNe: 'पृष्ठ ६: मनोरञ्जन र जीवनशैली (Lifestyle & World)',
    titleEn: 'Page 6: Lifestyle & World',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
    descriptionNe: 'कला, साहित्य, प्रविधि, स्वास्थ्य र विश्व समाचार',
    descriptionEn: 'Arts, cultural features, technology trends, and world reports',
  },
]

export default function EPaperPage() {
  const { language } = useLanguage()
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const [zoom, setZoom] = React.useState<number>(100)

  const todayBS = formatBikramSambat(new Date())
  const activePage = EPAPER_PAGES.find((p) => p.pageNumber === currentPage) || EPAPER_PAGES[0]

  const handleNext = () => {
    if (currentPage < EPAPER_PAGES.length) setCurrentPage((p) => p + 1)
  }

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* ePaper Navigation Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center shrink-0">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {language === 'ne' ? 'सबै छ डिजिटल ई-पत्रिका (ePaper)' : 'SabaiChha Digital ePaper Edition'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-red-500" />
                <span>{language === 'ne' ? todayBS.fullNepaliDate : todayBS.fullEnglishDate}</span>
                <span>•</span>
                <span>{language === 'ne' ? 'काठमाडौँ राष्ट्रिय संस्करण' : 'Kathmandu National Edition'}</span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(75, z - 15))}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono px-1.5 text-slate-600 dark:text-slate-300">
                {zoom}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(150, z + 15))}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(100)}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition"
                title="Reset Fit"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Download PDF button */}
            <button
              type="button"
              onClick={() => alert(language === 'ne' ? 'आजको ई-पत्रिका PDF डाउनलोड सुरु हुँदैछ...' : 'Initiating full edition PDF download...')}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'ne' ? 'PDF डाउनलोड' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* Page Thumbnail Strip */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
          {EPAPER_PAGES.map((p) => {
            const isActive = p.pageNumber === currentPage
            return (
              <button
                key={p.pageNumber}
                type="button"
                onClick={() => setCurrentPage(p.pageNumber)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-red-600 text-white border-red-600 shadow'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-red-400'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{language === 'ne' ? `पृष्ठ ${p.pageNumber}` : `Page ${p.pageNumber}`}</span>
              </button>
            )
          })}
        </div>

        {/* ePaper Canvas Viewer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-8 shadow-sm flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 mb-6">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {language === 'ne' ? activePage.titleNe : activePage.titleEn}
            </span>
            <span>
              {language === 'ne' ? activePage.descriptionNe : activePage.descriptionEn}
            </span>
          </div>

          {/* Newspaper Page Replica */}
          <div
            className="transition-transform duration-200 max-w-4xl w-full border border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl bg-white"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            {/* Header of newspaper page */}
            <div className="bg-red-600 text-white p-4 flex items-center justify-between border-b-2 border-slate-900">
              <div>
                <h2 className="text-2xl font-black tracking-wider uppercase font-serif">
                  सबै छ (SabaiChha)
                </h2>
                <p className="text-[10px] font-mono tracking-widest uppercase">
                  Nepal’s Premier Newspaper Replica • {todayBS.fullNepaliDate}
                </p>
              </div>
              <div className="text-right font-bold text-xs bg-black/20 px-3 py-1 rounded">
                PAGE {activePage.pageNumber}
              </div>
            </div>

            {/* Page Content Visual Mock */}
            <div className="relative aspect-4/5 w-full bg-slate-50">
              <Image
                src={activePage.image}
                alt={activePage.titleEn}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex flex-col justify-end p-6 sm:p-8 text-white">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-red-600 self-start uppercase mb-2">
                  {language === 'ne' ? 'विशेष कभरेज' : 'Special Feature'}
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight drop-shadow">
                  {language === 'ne' ? activePage.titleNe : activePage.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-2xl drop-shadow">
                  {language === 'ne' ? activePage.descriptionNe : activePage.descriptionEn}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Flipbook Navigation Bar */}
          <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 w-full">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{language === 'ne' ? 'अघिल्लो पृष्ठ' : 'Previous Page'}</span>
            </button>

            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
              {currentPage} / {EPAPER_PAGES.length}
            </span>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentPage === EPAPER_PAGES.length}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 disabled:opacity-40 transition cursor-pointer shadow"
            >
              <span>{language === 'ne' ? 'पछिल्लो पृष्ठ' : 'Next Page'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
