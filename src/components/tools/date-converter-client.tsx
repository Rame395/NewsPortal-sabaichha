'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/context/language-context'
import { toNepaliNumerals } from '@/lib/utils/numerals'
import {
  convertBsToAd,
  convertAdToBs,
  calculateDetailedAge,
  getBsMonthDays,
  NEPALI_MONTH_NAMES,
  ENGLISH_MONTH_NAMES,
} from '@/lib/date/nepali-date-converter'
import {
  Calendar,
  ArrowRightLeft,
  Copy,
  Check,
  Share2,
  Clock,
  HelpCircle,
  Hourglass,
  ArrowRight,
  ChevronDown,
  Newspaper,
  CalendarCheck,
} from 'lucide-react'

interface ArticleItem {
  id: string
  title: string
  slug: string
  featuredImage?: string | null
  publishedAt: string | null | Date
  category: { nameEn: string; nameNe: string; slug: string }
}

interface DateConverterClientProps {
  relatedArticles: ArticleItem[]
}

export function DateConverterClient({ relatedArticles }: DateConverterClientProps) {
  const { language } = useLanguage()
  const isNe = language === 'ne'

  const [activeTab, setActiveTab] = React.useState<'bs-to-ad' | 'ad-to-bs' | 'age'>('bs-to-ad')
  const [copied, setCopied] = React.useState(false)

  // Current today reference
  const now = new Date()
  const currentAdYear = now.getFullYear()
  const currentAdMonth = now.getMonth() + 1
  const currentAdDay = now.getDate()

  const todayBs = convertAdToBs(currentAdYear, currentAdMonth, currentAdDay)

  // BS to AD State
  const [bsYear, setBsYear] = React.useState<number>(todayBs.bsYear)
  const [bsMonth, setBsMonth] = React.useState<number>(todayBs.bsMonth)
  const [bsDay, setBsDay] = React.useState<number>(todayBs.bsDay)

  // AD to BS State
  const [adYear, setAdYear] = React.useState<number>(currentAdYear)
  const [adMonth, setAdMonth] = React.useState<number>(currentAdMonth)
  const [adDay, setAdDay] = React.useState<number>(currentAdDay)

  // Age Calculator State
  const [birthType, setBirthType] = React.useState<'bs' | 'ad'>('bs')
  const [birthBsYear, setBirthBsYear] = React.useState<number>(2055)
  const [birthBsMonth, setBirthBsMonth] = React.useState<number>(1)
  const [birthBsDay, setBirthBsDay] = React.useState<number>(1)
  const [birthAdDate, setBirthAdDate] = React.useState<string>('1998-04-14')

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = React.useState<number | null>(0)

  // Month days for BS Year and Month
  const maxBsDays = getBsMonthDays(bsYear, bsMonth - 1)
  React.useEffect(() => {
    if (bsDay > maxBsDays) {
      setBsDay(maxBsDays)
    }
  }, [bsYear, bsMonth, maxBsDays, bsDay])

  // Conversion results
  const bsToAdResult = React.useMemo(() => {
    try {
      return convertBsToAd(bsYear, bsMonth, bsDay)
    } catch {
      return null
    }
  }, [bsYear, bsMonth, bsDay])

  const adToBsResult = React.useMemo(() => {
    try {
      return convertAdToBs(adYear, adMonth, adDay)
    } catch {
      return null
    }
  }, [adYear, adMonth, adDay])

  // Age calculation
  const calculatedAge = React.useMemo(() => {
    try {
      let bDate: Date
      if (birthType === 'bs') {
        const converted = convertBsToAd(birthBsYear, birthBsMonth, birthBsDay)
        bDate = converted.adDate
      } else {
        bDate = new Date(birthAdDate)
      }
      return calculateDetailedAge(bDate, now)
    } catch {
      return null
    }
  }, [birthType, birthBsYear, birthBsMonth, birthBsDay, birthAdDate, now])

  const setBsToToday = () => {
    setBsYear(todayBs.bsYear)
    setBsMonth(todayBs.bsMonth)
    setBsDay(todayBs.bsDay)
  }

  const setAdToToday = () => {
    setAdYear(currentAdYear)
    setAdMonth(currentAdMonth)
    setAdDay(currentAdDay)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    const text = isNe
      ? `नेपाली मिति रूपान्तरक (वि.सं. ⇄ ई.सं.) - SabaiChha.com`
      : `Nepali Date Converter (B.S. to A.D.) - SabaiChha.com`

    if (navigator.share) {
      try {
        await navigator.share({
          title: text,
          url: window.location.href,
        })
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // FAQs
  const faqs = [
    {
      qNe: 'विक्रम संवत् (वि.सं.) र ईस्वी संवत् (ई.सं.) मा कति फरक छ?',
      qEn: 'What is the difference between Bikram Sambat (B.S.) and Gregorian (A.D.)?',
      aNe: 'विक्रम संवत् (B.S.) नेपालको आधिकारिक राष्ट्रिय पात्रो हो। यो ईस्वी संवत् (A.D.) भन्दा लगभग ५६ वर्ष, ८ महिना र १५–१७ दिन अगाडि रहन्छ। वैशाखदेखि चैतसम्मका महिनाहरूको दिन प्रत्येक वर्ष सौर्य गणना अनुसार फरक-फरक (२९ देखि ३२ दिन) हुन सक्छ।',
      aEn: 'Bikram Sambat (B.S.) is the official calendar of Nepal. It is approximately 56.7 years ahead of the Gregorian calendar (A.D.). While Gregorian calendar months have fixed days (except leap year Feb), Nepali months vary from 29 to 32 days each year based on astronomical solar transit.',
    },
    {
      qNe: 'सरकारी कागजात र भिसा आवेदनमा मिति रूपान्तरण कसरी गर्ने?',
      qEn: 'How to convert Nepali date for passport, visa, and bank documents?',
      aNe: 'नेपाली राहदानी (Passport), भिसा आवेदन, र बैंक खाता खोल्दा अंग्रेजी मिति (A.D.) अनिवार्य हुन्छ। हाम्रो टुलमा आफ्नो नागरिकता वा शैक्षिक प्रमाणपत्रमा भएको वि.सं. मिति छान्नुहोस् र तत्काल सही ई.सं. मिति प्राप्त गर्नुहोस्।',
      aEn: 'For international visas, passports, and banking, Gregorian (A.D.) dates are mandatory. Select your B.S. date from your citizenship certificate or birth certificate in this tool to instantly retrieve the corresponding A.D. date.',
    },
    {
      qNe: 'नेपाली पात्रोमा नयाँ वर्ष कुन दिन पर्छ?',
      qEn: 'When does the Nepali New Year start?',
      aNe: 'नेपाली नयाँ वर्ष वैशाख १ गते पर्दछ, जुन सामान्यतया अंग्रेजी पात्रोको अप्रिल १३ वा १४ तारिखमा पर्दछ।',
      aEn: 'Nepali New Year is celebrated on Baisakh 1, which generally falls on April 13 or April 14 of the Gregorian calendar.',
    },
  ]

  // BS Years range (2000 to 2095)
  const bsYearsList = Array.from({ length: 96 }, (_, i) => 2095 - i)
  // AD Years range (1944 to 2038)
  const adYearsList = Array.from({ length: 95 }, (_, i) => 2038 - i)

  return (
    <div className="space-y-8">
      {/* 1. Refined Editorial Header Masthead */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 text-red-700 dark:text-red-400 font-bold border border-red-500/20">
                <CalendarCheck className="w-3.5 h-3.5" />
                {isNe ? 'आधिकारिक नेपाली क्यालेन्डर' : 'Official Nepali Calendar'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {isNe ? 'सटीक विक्रम संवत् रूपान्तरण' : 'Accurate Bikram Sambat Conversion'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              {isNe
                ? 'नेपाली मिति रूपान्तरक (वि.सं. ⇄ ई.सं.)'
                : 'Nepali Date Converter (B.S. ⇄ A.D.)'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {isNe
                ? 'विक्रम संवत् (वि.सं.) बाट अंग्रेजी (ई.सं.) मा र अंग्रेजीबाट नेपालीमा तत्काल सही रूपान्तरण गर्नुहोस्। राहदानी, भिसा, लोकसेवा र उमेर गणनाका लागि उपयोगी।'
                : 'Accurate two-way Bikram Sambat to Gregorian date conversion. Essential for passport, visa processing, civil service exams, and exact age calculation.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? (isNe ? 'लिङ्क कपी भयो!' : 'Copied!') : (isNe ? 'साझा गर्नुहोस्' : 'Share Tool')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Tool Navigation Segmented Controls */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 max-w-lg mx-auto border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('bs-to-ad')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'bs-to-ad'
              ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{isNe ? 'वि.सं. ➔ ई.सं.' : 'B.S. to A.D.'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ad-to-bs')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'ad-to-bs'
              ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>{isNe ? 'ई.सं. ➔ वि.सं.' : 'A.D. to B.S.'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('age')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'age'
              ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Hourglass className="w-3.5 h-3.5" />
          <span>{isNe ? 'उमेर क्यालकुलेटर' : 'Age Calculator'}</span>
        </button>
      </div>

      {/* 3. Tab 1: BS to AD Converter */}
      {activeTab === 'bs-to-ad' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                <span>{isNe ? 'नेपाली मिति (वि.सं.) छान्नुहोस्' : 'Select Nepali Date (B.S.)'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isNe ? 'साल, महिना र गते छनोट गर्नुहोस्' : 'Choose year, month, and day'}
              </p>
            </div>
            <button
              type="button"
              onClick={setBsToToday}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-red-500 transition cursor-pointer"
            >
              {isNe ? 'आजको मिति' : 'Today'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Year */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isNe ? 'वर्ष (Year)' : 'Year (B.S.)'}
              </label>
              <select
                value={bsYear}
                onChange={(e) => setBsYear(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
              >
                {bsYearsList.map((y) => (
                  <option key={y} value={y}>
                    {isNe ? `${toNepaliNumerals(y)} वि.सं.` : `${y} B.S.`}
                  </option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isNe ? 'महिना (Month)' : 'Month'}
              </label>
              <select
                value={bsMonth}
                onChange={(e) => setBsMonth(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
              >
                {NEPALI_MONTH_NAMES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {isNe ? `${toNepaliNumerals(m.id)}. ${m.nameNe}` : `${m.id}. ${m.nameEn}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Day */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isNe ? 'गते (Day)' : 'Day'}
              </label>
              <select
                value={bsDay}
                onChange={(e) => setBsDay(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
              >
                {Array.from({ length: maxBsDays }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {isNe ? `${toNepaliNumerals(d)} गते` : `${d}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clean Editorial Result Box */}
          {bsToAdResult && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isNe ? 'रूपान्तरित अंग्रेजी मिति (A.D.)' : 'Converted Gregorian Date (A.D.)'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `${bsToAdResult.formattedAdDate} (${isNe ? bsToAdResult.weekdayNe : bsToAdResult.weekdayEn})`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? (isNe ? 'प्रतिलिपि गरियो!' : 'Copied!') : (isNe ? 'कपी गर्नुहोस्' : 'Copy')}</span>
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                  {bsToAdResult.formattedAdDate}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {isNe ? bsToAdResult.weekdayNe : bsToAdResult.weekdayEn}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-slate-500">
                    ISO 8601: {bsToAdResult.adYear}-{String(bsToAdResult.adMonth).padStart(2, '0')}-
                    {String(bsToAdResult.adDay).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Tab 2: AD to BS Converter */}
      {activeTab === 'ad-to-bs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                <span>{isNe ? 'अंग्रेजी मिति (ई.सं.) छान्नुहोस्' : 'Select Gregorian Date (A.D.)'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isNe ? 'Year, Month र Date छनोट गर्नुहोस्' : 'Choose year, month, and date'}
              </p>
            </div>
            <button
              type="button"
              onClick={setAdToToday}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-red-500 transition cursor-pointer"
            >
              {isNe ? 'आजको मिति' : 'Today'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Year */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isNe ? 'वर्ष (Year)' : 'Year (A.D.)'}
              </label>
              <select
                value={adYear}
                onChange={(e) => setAdYear(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
              >
                {adYearsList.map((y) => (
                  <option key={y} value={y}>
                    {y} A.D.
                  </option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isNe ? 'महिना (Month)' : 'Month'}
              </label>
              <select
                value={adMonth}
                onChange={(e) => setAdMonth(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
              >
                {ENGLISH_MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {idx + 1}. {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Day */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isNe ? 'तारिख (Day)' : 'Day'}
              </label>
              <select
                value={adDay}
                onChange={(e) => setAdDay(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clean Result Box */}
          {adToBsResult && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isNe ? 'रूपान्तरित नेपाली मिति (वि.सं.)' : 'Converted Nepali Date (B.S.)'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `${adToBsResult.formattedBsDate} (${isNe ? adToBsResult.weekdayNe : adToBsResult.weekdayEn})`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? (isNe ? 'प्रतिलिपि गरियो!' : 'Copied!') : (isNe ? 'कपी गर्नुहोस्' : 'Copy')}</span>
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                  {isNe
                    ? `${adToBsResult.bsMonthNameNe} ${toNepaliNumerals(adToBsResult.bsDay)}, ${toNepaliNumerals(adToBsResult.bsYear)}`
                    : `${adToBsResult.bsMonthNameEn} ${adToBsResult.bsDay}, ${adToBsResult.bsYear} B.S.`}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {isNe ? adToBsResult.weekdayNe : adToBsResult.weekdayEn}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-slate-500">
                    {adToBsResult.bsYear}-{String(adToBsResult.bsMonth).padStart(2, '0')}-
                    {String(adToBsResult.bsDay).padStart(2, '0')} B.S.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Tab 3: Detailed Age Calculator */}
      {activeTab === 'age' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-red-600" />
                <span>{isNe ? 'जन्म मितिबाट उमेर गणना' : 'Calculate Exact Age from Birth Date'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isNe ? 'वर्ष, महिना, र दिनको विस्तृत गणना' : 'Accurate years, months, and days breakdown'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setBirthType('bs')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                  birthType === 'bs'
                    ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                वि.सं. (B.S.)
              </button>
              <button
                type="button"
                onClick={() => setBirthType('ad')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                  birthType === 'ad'
                    ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                ई.सं. (A.D.)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {birthType === 'bs' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isNe ? 'जन्म वर्ष (वि.सं.)' : 'Birth Year (B.S.)'}
                  </label>
                  <select
                    value={birthBsYear}
                    onChange={(e) => setBirthBsYear(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                  >
                    {bsYearsList.map((y) => (
                      <option key={y} value={y}>
                        {isNe ? `${toNepaliNumerals(y)} वि.सं.` : `${y} B.S.`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isNe ? 'जन्म महिना' : 'Birth Month'}
                  </label>
                  <select
                    value={birthBsMonth}
                    onChange={(e) => setBirthBsMonth(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                  >
                    {NEPALI_MONTH_NAMES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {isNe ? m.nameNe : m.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isNe ? 'जन्म गते' : 'Birth Day'}
                  </label>
                  <select
                    value={birthBsDay}
                    onChange={(e) => setBirthBsDay(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                  >
                    {Array.from({ length: 32 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {isNe ? `${toNepaliNumerals(d)} गते` : d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isNe ? 'अंग्रेजी जन्म मिति (A.D.)' : 'Birth Date (A.D.)'}
                </label>
                <input
                  type="date"
                  value={birthAdDate}
                  onChange={(e) => setBirthAdDate(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                />
              </div>
            )}
          </div>

          {/* Age Result */}
          {calculatedAge && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isNe ? 'तपाईंको कुल उमेर' : 'Your Total Age'}
              </span>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 font-mono">
                    {isNe ? toNepaliNumerals(calculatedAge.years) : calculatedAge.years}
                  </span>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {isNe ? 'वर्ष' : 'Years'}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                    {isNe ? toNepaliNumerals(calculatedAge.months) : calculatedAge.months}
                  </span>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {isNe ? 'महिना' : 'Months'}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                    {isNe ? toNepaliNumerals(calculatedAge.days) : calculatedAge.days}
                  </span>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {isNe ? 'दिन' : 'Days'}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{isNe ? 'आजसम्मको कुल दिन:' : 'Total Days Lived:'}</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {isNe
                    ? `${toNepaliNumerals(calculatedAge.totalDays.toLocaleString('en-IN'))} दिन`
                    : `${calculatedAge.totalDays.toLocaleString('en-US')} Days`}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. FAQ Accordions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-red-600" />
          <h3 className="text-base font-black text-slate-950 dark:text-white">
            {isNe ? 'प्रायः सोधिने प्रश्नहरू (FAQ)' : 'Frequently Asked Questions (FAQ)'}
          </h3>
        </div>

        <div className="space-y-2.5 pt-1">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
                >
                  <span>{isNe ? faq.qNe : faq.qEn}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-red-600' : 'text-slate-400'
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                    {isNe ? faq.aNe : faq.aEn}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 7. Related Articles Cross-Promotion */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-red-600">
            <h3 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-red-600" />
              <span>{isNe ? 'ताजा तथा मुख्य समाचार' : 'Latest News Highlights'}</span>
            </h3>
            <Link
              href="/"
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              <span>{isNe ? 'गृहपृष्ठ' : 'Home'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedArticles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col"
              >
                {article.featuredImage && (
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-950">
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                )}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                    {isNe ? article.category.nameNe : article.category.nameEn}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-2 leading-snug">
                    {article.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
