'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/context/language-context'
import { toNepaliNumerals } from '@/lib/utils/numerals'
import { formatBikramSambat } from '@/lib/date/nepali-calendar'
import { RashiItem } from '@/lib/horoscope/rashifal-service'
import {
  Share2,
  Check,
  Compass,
  Clock,
  HelpCircle,
  Newspaper,
  ArrowRight,
  ChevronDown,
  Search,
  Sparkles,
  Calendar,
} from 'lucide-react'

interface ArticleItem {
  id: string
  title: string
  slug: string
  featuredImage?: string | null
  publishedAt: string | null | Date
  category: { nameEn: string; nameNe: string; slug: string }
}

interface RashifalClientProps {
  rashifalList: RashiItem[]
  relatedArticles: ArticleItem[]
}

export function RashifalClient({ rashifalList, relatedArticles }: RashifalClientProps) {
  const { language } = useLanguage()
  const isNe = language === 'ne'

  const dateObj = new Date()
  const bsDate = formatBikramSambat(dateObj)

  const [selectedRashiId, setSelectedRashiId] = React.useState<string>(rashifalList[0]?.id || 'aries')
  const [copied, setCopied] = React.useState<boolean>(false)
  const [openFaq, setOpenFaq] = React.useState<number | null>(0)
  const [nameLetterQuery, setNameLetterQuery] = React.useState<string>('')

  const activeRashi = rashifalList.find((r) => r.id === selectedRashiId) || rashifalList[0]

  const handleShare = async () => {
    const text = isNe
      ? `आजको ${activeRashi.nameNe} राशिफल (${bsDate.shortNepaliDate}) - SabaiChha.com\n\n${activeRashi.predictionNe}\nशुभ अंक: ${activeRashi.luckyNumber} | शुभ रंग: ${activeRashi.luckyColorNe}`
      : `Today's ${activeRashi.nameEn} Horoscope - SabaiChha.com\n\n${activeRashi.predictionEn}\nLucky Number: ${activeRashi.luckyNumber} | Lucky Color: ${activeRashi.luckyColorEn}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `आजको ${activeRashi.nameNe} राशिफल | SabaiChha.com`,
          text,
          url: window.location.href,
        })
      } catch {}
    } else {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Find Rashi by name letter
  const matchedRashi = React.useMemo(() => {
    if (!nameLetterQuery.trim()) return null
    const q = nameLetterQuery.trim().toLowerCase()
    return rashifalList.find((r) =>
      r.letters.toLowerCase().includes(q) || r.nameNe.includes(q) || r.nameEn.toLowerCase().includes(q)
    )
  }, [nameLetterQuery, rashifalList])

  // FAQs
  const faqs = [
    {
      qNe: 'राशिफल भनेको के हो र यसले कसरी काम गर्छ?',
      qEn: 'What is Rashifal and how does Vedic astrology work?',
      aNe: 'वैदिक ज्योतिषशास्त्र अनुसार व्यक्तिको जन्म हुँदा आकाशमा चन्द्रमा जुन राशिमा अवस्थित हुन्छ, त्यसलाई चन्द्र राशि (Moon Sign) भनिन्छ। दैनिक राशिफलमा सूर्य, चन्द्रमा र अन्य नवग्रहहरूको गोचर (वर्तमान स्थिति) को आधारमा दिनभरिको सम्भावित प्रभावको फलादेश गरिन्छ।',
      aEn: 'In Vedic astrology, your Rashi (Moon Sign) is determined by the position of the Moon at the exact moment of your birth. Daily Rashifal calculates the planetary transits (Gochar) of the Sun, Moon, and planets to forecast energetic trends, opportunities, and cautions for each day.',
    },
    {
      qNe: 'आफ्नो राशि कसरी पत्ता लगाउने?',
      qEn: 'How to find your Rashi according to your birth name?',
      aNe: 'यदि तपाईंको जन्मकुण्डली छैन भने तपाईंको बोलाउने वा औपचारिक नामको पहिलो अक्षर (नामाक्षर) बाट राशि पत्ता लगाउन सकिन्छ (जस्तै: "रा, रि, रु, रे, रो" बाट नाम आउनेको तुला राशि हुन्छ, "का, कि, कु" बाट मिथुन राशि हुन्छ)।',
      aEn: 'If your birth chart is unavailable, your Rashi can be derived from the first syllable (Namakshar) of your formal name. For example, names starting with "Ra, Ri, Ru" belong to Libra (तुला), while "Ka, Ki, Ku" belong to Gemini (मिथुन).',
    },
    {
      qNe: 'राशिफल कति बजे अपडेट हुन्छ?',
      qEn: 'What time is daily Rashifal updated on SabaiChha.com?',
      aNe: 'SabaiChha.com मा दैनिक राशिफल प्रत्येक दिन बिहानै सूर्योदयसँगै नयाँ पञ्चाङ्ग र तिथि अनुसार अद्यावधिक हुन्छ।',
      aEn: 'Daily Rashifal on SabaiChha.com updates automatically every morning at dawn according to the latest Bikram Sambat calendar and planetary transit.',
    },
  ]

  return (
    <div className="space-y-8">
      {/* 1. Refined Editorial Header Masthead */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-400 font-bold border border-purple-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                {isNe ? 'दैनिक वैदिक ज्योतिष' : 'Daily Vedic Astrology'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {isNe ? '१२ वटै राशिको भाग्यफल' : 'All 12 Signs Horoscope'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              {isNe ? 'आजको राशिफल (दैनिक फलादेश)' : 'Daily Rashifal & Horoscope'}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span suppressHydrationWarning>{isNe ? bsDate.fullNepaliDate : bsDate.fullEnglishDate}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{isNe ? 'नयाँ पञ्चाङ्ग अनुसार अद्यावधिक' : 'Updated Daily with Panchang'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? (isNe ? 'प्रतिलिपि गरियो!' : 'Copied!') : (isNe ? 'राशिफल साझा गर्नुहोस्' : 'Share Rashifal')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 12 Zodiac Quick Selector Bar */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
        {rashifalList.map((r) => {
          const isSelected = r.id === selectedRashiId
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRashiId(r.id)}
              className={`p-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition cursor-pointer border text-center ${
                isSelected
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-purple-400'
              }`}
            >
              <span className="text-xl leading-none">{r.symbol}</span>
              <span className="text-[11px] font-bold whitespace-nowrap">
                {isNe ? r.nameNe : r.nameEn}
              </span>
            </button>
          )
        })}
      </div>

      {/* 3. Active Rashi Detailed Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 text-2xl flex items-center justify-center border border-purple-500/20">
              {activeRashi.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                  {isNe ? `${activeRashi.nameNe} राशि` : `${activeRashi.nameEn} (${activeRashi.nameNe})`}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-200 dark:border-purple-900/40">
                  {isNe ? activeRashi.elementNe : activeRashi.elementEn}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isNe ? 'नामाक्षर:' : 'Name Letters:'}{' '}
                <strong className="text-slate-700 dark:text-slate-300 font-semibold">{activeRashi.letters}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Prediction Narrative */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-sans">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isNe ? 'दैनिक भाग्य फलादेश' : "Today's Astrological Prediction"}</span>
          </h3>
          <p>{isNe ? activeRashi.predictionNe : activeRashi.predictionEn}</p>
        </div>

        {/* Astrological Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {isNe ? 'शुभ अंक' : 'Lucky Number'}
            </span>
            <span className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">
              {isNe ? toNepaliNumerals(activeRashi.luckyNumber) : activeRashi.luckyNumber}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {isNe ? 'शुभ रंग' : 'Lucky Color'}
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
              {isNe ? activeRashi.luckyColorNe : activeRashi.luckyColorEn}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {isNe ? 'शुभ दिशा' : 'Lucky Direction'}
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
              <Compass className="w-3.5 h-3.5 text-purple-500" />
              <span>{isNe ? activeRashi.luckyDirectionNe : activeRashi.luckyDirectionEn}</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {isNe ? 'स्वामी ग्रह' : 'Ruling Planet'}
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
              {isNe ? activeRashi.planetNe : activeRashi.planetEn}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Find Your Rashi by Name Tool */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-purple-600" />
          <span>{isNe ? 'नामको पहिलो अक्षरबाट आफ्नो राशि पत्ता लगाउनुहोस्' : 'Find Your Rashi from First Letter of Name'}</span>
        </h3>
        <p className="text-xs text-slate-500">
          {isNe
            ? 'आफ्नो नामको पहिलो अक्षर (उदा: रा, का, म, स) टाइप गर्नुहोस्:'
            : 'Type the starting syllable of your name (e.g. Ra, Ka, Ma, Su):'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center pt-1">
          <input
            type="text"
            value={nameLetterQuery}
            onChange={(e) => setNameLetterQuery(e.target.value)}
            placeholder={isNe ? 'अक्षर टाइप गर्नुहोस् (उदा: रा)...' : 'Type letter (e.g. Ra)...'}
            className="w-full sm:w-72 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />

          {matchedRashi && (
            <div className="p-2.5 px-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center gap-2.5">
              <span className="text-xl">{matchedRashi.symbol}</span>
              <div>
                <span className="text-[11px] text-slate-500 block">
                  {isNe ? 'तपाईंको राशि:' : 'Your Zodiac Sign:'}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedRashiId(matchedRashi.id)}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                >
                  {isNe ? `${matchedRashi.nameNe} राशि (हेर्नुहोस्)` : `${matchedRashi.nameEn} (View)`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Complete 12 Rashi Overview Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-slate-950 dark:text-white">
          {isNe ? 'सबै १२ राशिको आजको फलादेश' : 'All 12 Rashi Daily Horoscopes'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rashifalList.map((r) => (
            <div
              key={r.id}
              className={`p-4 rounded-xl bg-white dark:bg-slate-900 border transition flex flex-col justify-between space-y-3 cursor-pointer ${
                r.id === selectedRashiId
                  ? 'border-purple-500 shadow-xs ring-2 ring-purple-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-purple-400/50'
              }`}
              onClick={() => setSelectedRashiId(r.id)}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{r.symbol}</span>
                    <span className="text-sm font-bold text-slate-950 dark:text-white">
                      {isNe ? r.nameNe : r.nameEn}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md">
                    {isNe ? `अंक: ${toNepaliNumerals(r.luckyNumber)}` : `No: ${r.luckyNumber}`}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {isNe ? r.predictionNe : r.predictionEn}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>{isNe ? `रंग: ${r.luckyColorNe}` : `Color: ${r.luckyColorEn}`}</span>
                <span className="font-bold text-purple-600 hover:underline">
                  {isNe ? 'पूरा हेर्नुहोस् ➔' : 'Read More ➔'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

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
                  className="w-full p-3.5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer"
                >
                  <span>{isNe ? faq.qNe : faq.qEn}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-purple-600' : 'text-slate-400'
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
