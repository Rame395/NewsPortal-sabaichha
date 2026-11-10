'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/context/language-context'
import { toNepaliNumerals } from '@/lib/utils/numerals'
import { formatBikramSambat } from '@/lib/date/nepali-calendar'
import { CurrencyRateItem } from '@/lib/market/forex-service'
import {
  DollarSign,
  ArrowRightLeft,
  Search,
  Check,
  Share2,
  Copy,
  Clock,
  HelpCircle,
  ShieldCheck,
  Building2,
  ArrowRight,
  ChevronDown,
  Newspaper,
  Calendar,
  Info,
} from 'lucide-react'

interface ArticleItem {
  id: string
  title: string
  slug: string
  featuredImage?: string | null
  publishedAt: string | null | Date
  category: { nameEn: string; nameNe: string; slug: string }
}

interface ForexConverterClientProps {
  rates: CurrencyRateItem[]
  usdRate: number
  lastUpdated: string
  relatedArticles: ArticleItem[]
}

export function ForexConverterClient({
  rates,
  usdRate,
  lastUpdated,
  relatedArticles,
}: ForexConverterClientProps) {
  const { language } = useLanguage()
  const isNe = language === 'ne'

  const dateObj = new Date()
  const bsDate = formatBikramSambat(dateObj)

  // Calculator State
  const [calcAmount, setCalcAmount] = React.useState<string>('100')
  const [fromCurrency, setFromCurrency] = React.useState<string>('USD')
  const [toCurrency, setToCurrency] = React.useState<string>('NPR')
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const [copied, setCopied] = React.useState<boolean>(false)
  const [openFaq, setOpenFaq] = React.useState<number | null>(0)

  // Rate lookups
  const getRate = (code: string) => {
    if (code === 'NPR') return { buyRate: 1, sellRate: 1, unit: 1 }
    const found = rates.find((r) => r.code === code)
    return found ? { buyRate: found.buyRate, sellRate: found.sellRate, unit: found.unit } : { buyRate: 1, sellRate: 1, unit: 1 }
  }

  // Convert calculation
  const calculateConversion = () => {
    const amt = parseFloat(calcAmount) || 0
    if (amt <= 0) return 0

    const fromRate = getRate(fromCurrency)
    const toRate = getRate(toCurrency)

    // Convert fromCurrency to NPR (base NPR value)
    const inNpr = fromCurrency === 'NPR' ? amt : (amt * fromRate.buyRate) / fromRate.unit

    // Convert from NPR to toCurrency
    const result = toCurrency === 'NPR' ? inNpr : (inNpr / toRate.sellRate) * toRate.unit
    return Number(result.toFixed(2))
  }

  const convertedResult = calculateConversion()

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const handleShare = async () => {
    const text = isNe
      ? `आजको विदेशी मुद्रा विनिमय दर (SabaiChha.com): १ अमेरिकी डलर = रु ${usdRate.toFixed(2)} (नेपाल राष्ट्र बैंक दर)`
      : `Today's NRB Forex Exchange Rates in Nepal (SabaiChha.com): 1 USD = Rs ${usdRate.toFixed(2)}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'विदेशी मुद्रा विनिमय दर | NRB Forex Rate',
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

  const handleCopyResult = () => {
    navigator.clipboard.writeText(`${calcAmount} ${fromCurrency} = ${convertedResult} ${toCurrency}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Filtered rates for table
  const filteredRates = rates.filter(
    (r) =>
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nameNe.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // FAQs
  const faqs = [
    {
      qNe: 'नेपालमा विदेशी मुद्रा विनिमय दर कसले निर्धारण गर्छ?',
      qEn: 'Who determines the foreign currency exchange rates in Nepal?',
      aNe: 'नेपालमा विदेशी मुद्राको दैनिक विनिमय दर नेपालको केन्द्रीय बैंक "नेपाल राष्ट्र बैंक" (NRB) ले अन्तर्राष्ट्रिय मुद्रा बजार र माग-आपूर्तिको आधारमा प्रत्येक दिन बिहान निर्धारण गर्दछ।',
      aEn: 'The official daily foreign currency exchange rates in Nepal are fixed by Nepal Rastra Bank (NRB), the central bank of Nepal, based on international currency market spot rates and liquidity.',
    },
    {
      qNe: 'खरिद दर (Buy Rate) र बिक्री दर (Sell Rate) मा के फरक हुन्छ?',
      qEn: 'What is the difference between Buying Rate and Selling Rate?',
      aNe: 'खरिद दर (Buying Rate) भनेको बैंक वा मनि एक्सचेन्जले तपाईंसँग विदेशी मुद्रा किन्दा दिने मूल्य हो। बिक्री दर (Selling Rate) भनेको बैंकले तपाईंलाई विदेशी मुद्रा बेच्दा लिने मूल्य हो। सामान्यतया बिक्री दर खरिद दरभन्दा केही बढी हुन्छ।',
      aEn: 'The Buying Rate is what banks or exchange counters pay you when you sell them foreign currency. The Selling Rate is what you must pay to purchase foreign currency from a bank. The difference is the spread margin.',
    },
    {
      qNe: 'नेपालमा भारतीय रुपैयाँ (INR) को दर किन स्थिर रहन्छ?',
      qEn: 'Why is the Indian Rupee (INR) rate fixed in Nepal?',
      aNe: 'नेपाल र भारतबीचको द्विपक्षीय व्यापार र खुला सिमानाका कारण नेपाली रुपैयाँ भारतीय रुपैयाँसँग स्थिर विनिमय दर (Pegged Exchange Rate) मा बाँधिएको छ, जहाँ १०० भारतीय रुपैयाँ बराबर १ सय ६० नेपाली रुपैयाँ (१६० खरिद र १६०.१५ बिक्री) निर्धारण गरिएको छ।',
      aEn: 'Due to extensive bilateral trade and open borders, the Nepalese Rupee (NPR) is officially pegged to the Indian Rupee (INR) at an immovable rate of 100 INR = 160 NPR.',
    },
  ]

  const currencyOptions = [
    { code: 'NPR', label: isNe ? 'नेपाली रुपैयाँ (NPR)' : 'Nepalese Rupee (NPR)', flag: '🇳🇵' },
    ...rates.map((r) => ({
      code: r.code,
      label: `${r.flag} ${r.code} - ${isNe ? r.nameNe : r.nameEn}`,
      flag: r.flag,
    })),
  ]

  return (
    <div className="space-y-8">
      {/* 1. Refined Editorial Header Masthead */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isNe ? 'आधिकारिक केन्द्रीय बैंक दर' : 'Official Central Bank Rates'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {isNe ? 'स्रोत: नेपाल राष्ट्र बैंक (NRB)' : 'Source: Nepal Rastra Bank (NRB)'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              {isNe ? 'विदेशी मुद्रा विनिमय दर तथा क्यालकुलेटर' : 'Live NRB Forex Rates & Currency Converter'}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span suppressHydrationWarning>{isNe ? bsDate.fullNepaliDate : bsDate.fullEnglishDate}</span>
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {isNe ? `१ अमेरिकी डलर = रु ${toNepaliNumerals(usdRate.toFixed(2))}` : `1 USD = Rs ${usdRate.toFixed(2)} NPR`}
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
              <span>{copied ? (isNe ? 'प्रतिलिपि गरियो!' : 'Copied!') : (isNe ? 'साझा गर्नुहोस्' : 'Share Rate')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Multi-Currency Converter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-950 dark:text-white">
              {isNe ? 'मुद्रा रूपान्तरण क्यालकुलेटर' : 'Instant Currency Converter'}
            </h2>
            <p className="text-xs text-slate-500">
              {isNe
                ? 'डलर, रियाल, दिर्हाम, पाउन्ड र युरोलाई तत्काल नेपाली रुपैयाँमा हिसाब गर्नुहोस्'
                : 'Convert USD, QAR, SAR, AED, EUR, GBP to NPR and vice versa in real time'}
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Controls: 7 cols */}
          <div className="lg:col-span-7 space-y-4">
            {/* Amount input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isNe ? 'रकम (Amount)' : 'Enter Amount'}
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-lg font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                placeholder="100"
              />
            </div>

            {/* From & To with Swap */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isNe ? 'स्रोत मुद्रा (From)' : 'From Currency'}
                </label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {currencyOptions.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={swapCurrencies}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer border border-slate-200 dark:border-slate-700"
                  title="Swap Currencies"
                >
                  <ArrowRightLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </button>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isNe ? 'गन्तव्य मुद्रा (To)' : 'To Currency'}
                </label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {currencyOptions.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick preset chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['100', '500', '1000', '2500', '5000'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCalcAmount(val)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Result Card: 5 cols */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isNe ? 'रूपान्तरित विनिमय मूल्य' : 'Converted Value'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyResult}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium">
                  {calcAmount} {fromCurrency} =
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight mt-1">
                  {toCurrency === 'NPR'
                    ? isNe
                      ? `रु ${toNepaliNumerals(convertedResult.toLocaleString('en-IN'))}`
                      : `Rs ${convertedResult.toLocaleString('en-IN')}`
                    : `${convertedResult.toLocaleString('en-US')} ${toCurrency}`}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-start gap-2 text-[11px] text-slate-500 leading-normal">
              <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {isNe
                  ? 'नोट: रेमिट्यान्स पठाउँदा बैंक वा मनि ट्रान्सफर अनुसार सेवा शुल्क र दरमा सामान्य फरक हुन सक्छ।'
                  : 'Note: Final remittance rates may slightly differ by transfer provider (IME, Western Union, Banks).'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Complete NRB Daily Exchange Rates Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>{isNe ? 'दैनिक विदेशी मुद्रा विनिमय दर तालिका' : 'Official NRB Exchange Rates Table'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isNe ? 'नेपाल राष्ट्र बैंकले तोकेको दैनिक खरिद तथा बिक्री दर:' : 'Official Buying and Selling rates by Nepal Rastra Bank:'}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isNe ? 'मुद्रा खोज्नुहोस्...' : 'Search currency...'}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">{isNe ? 'मुद्रा (Currency)' : 'Currency'}</th>
                <th className="py-2.5 px-3 text-center">{isNe ? 'इकाइ (Unit)' : 'Unit'}</th>
                <th className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400">
                  {isNe ? 'खरिद दर (Buying)' : 'Buying (NPR)'}
                </th>
                <th className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                  {isNe ? 'बिक्री दर (Selling)' : 'Selling (NPR)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRates.map((r) => (
                <tr key={r.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{r.flag}</span>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white font-mono text-xs block">
                          {r.code}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {isNe ? r.nameNe : r.nameEn}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold font-mono text-slate-600 dark:text-slate-400">
                    {r.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {isNe ? `रु ${toNepaliNumerals(r.buyRate.toFixed(2))}` : `Rs ${r.buyRate.toFixed(2)}`}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900 dark:text-white">
                    {isNe ? `रु ${toNepaliNumerals(r.sellRate.toFixed(2))}` : `Rs ${r.sellRate.toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. FAQ Accordions */}
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
                  className="w-full p-3.5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
                >
                  <span>{isNe ? faq.qNe : faq.qEn}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-600' : 'text-slate-400'
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

      {/* 5. Related News Cross-Promotion */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-red-600">
            <h3 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-red-600" />
              <span>{isNe ? 'सम्बन्धित आर्थिक तथा रेमिट्यान्स समाचार' : 'Related Economy & Remittance News'}</span>
            </h3>
            <Link
              href="/category/economy"
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              <span>{isNe ? 'थप समाचार' : 'More'}</span>
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
