'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/context/language-context'
import { toNepaliNumerals } from '@/lib/utils/numerals'
import { formatBikramSambat } from '@/lib/date/nepali-calendar'
import {
  Coins,
  Calculator,
  Share2,
  Check,
  ChevronDown,
  HelpCircle,
  Scale,
  Newspaper,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Info,
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

interface GoldSilverClientProps {
  initialGoldRate: number
  initialSilverRate: number
  lastUpdated: string
  relatedArticles: ArticleItem[]
}

// Gram conversion constants
const TOLA_IN_GRAMS = 11.6638
const AANA_IN_TOLA = 1 / 16 // 1 Tola = 16 Aana
const LAL_IN_TOLA = 1 / 64 // 1 Tola = 64 Lal

export function GoldSilverClient({
  initialGoldRate,
  initialSilverRate,
  lastUpdated,
  relatedArticles,
}: GoldSilverClientProps) {
  const { language } = useLanguage()
  const isNe = language === 'ne'

  // Rates calculation
  // Fine Gold 24K
  const fineGoldTola = initialGoldRate
  const fineGold10G = Math.round((fineGoldTola / TOLA_IN_GRAMS) * 10)
  const fineGold1G = Math.round(fineGoldTola / TOLA_IN_GRAMS)

  // Tejabi Gold 22K (usually ~Rs 1,000 less per tola in Nepal standard)
  const tejabiGoldTola = Math.max(fineGoldTola - 1000, 100000)
  const tejabiGold10G = Math.round((tejabiGoldTola / TOLA_IN_GRAMS) * 10)
  const tejabiGold1G = Math.round(tejabiGoldTola / TOLA_IN_GRAMS)

  // Silver
  const silverTola = initialSilverRate
  const silver10G = Math.round((silverTola / TOLA_IN_GRAMS) * 10)
  const silver1G = Math.round(silverTola / TOLA_IN_GRAMS)

  // Date info
  const dateObj = new Date()
  const bsDate = formatBikramSambat(dateObj)

  // Calculator State
  const [calcMetal, setCalcMetal] = React.useState<'fine' | 'tejabi' | 'silver'>('fine')
  const [calcUnit, setCalcUnit] = React.useState<'tola' | 'gram' | 'aana' | 'lal'>('tola')
  const [calcWeight, setCalcWeight] = React.useState<string>('1')
  const [calcMakingChargePct, setCalcMakingChargePct] = React.useState<number>(0)
  const [copied, setCopied] = React.useState(false)

  // FAQ open states
  const [openFaq, setOpenFaq] = React.useState<number | null>(0)

  // Calculate total price
  const calculateTotal = () => {
    const w = parseFloat(calcWeight) || 0
    let tolas = 0

    if (calcUnit === 'tola') tolas = w
    else if (calcUnit === 'gram') tolas = w / TOLA_IN_GRAMS
    else if (calcUnit === 'aana') tolas = w * AANA_IN_TOLA
    else if (calcUnit === 'lal') tolas = w * LAL_IN_TOLA

    let ratePerTola = fineGoldTola
    if (calcMetal === 'tejabi') ratePerTola = tejabiGoldTola
    if (calcMetal === 'silver') ratePerTola = silverTola

    const basePrice = tolas * ratePerTola
    const makingAmount = basePrice * (calcMakingChargePct / 100)
    return Math.round(basePrice + makingAmount)
  }

  const calculatedTotal = calculateTotal()

  const handleShare = async () => {
    const text = isNe
      ? `आजको सुनचाँदीको भाउ (SabaiChha.com): छापावाल सुन प्रति तोला रु ${fineGoldTola.toLocaleString('en-IN')}, चाँदी रु ${silverTola.toLocaleString('en-IN')}`
      : `Today's Gold & Silver Rate in Nepal (SabaiChha.com): Fine Gold Rs ${fineGoldTola.toLocaleString('en-IN')}/tola, Silver Rs ${silverTola.toLocaleString('en-IN')}/tola`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'सुनको भाउ आज | Gold Rate Nepal',
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

  // FAQs
  const faqs = [
    {
      qNe: 'आज नेपालमा छापावाल सुनको भाउ कति छ?',
      qEn: 'What is the price of Fine Gold (24K) in Nepal today?',
      aNe: `आज नेपाल सुनचाँदी व्यवसायी महासंघ (FENEGOSIDA) को आधिकारिक दर अनुसार छापावाल सुन (२४ क्यारेट) प्रति तोला रु ${toNepaliNumerals(fineGoldTola.toLocaleString('en-IN'))} र प्रति १० ग्राम रु ${toNepaliNumerals(fineGold10G.toLocaleString('en-IN'))} कायम भएको छ।`,
      aEn: `As per official rates from the Federation of Nepal Gold and Silver Dealers' Association (FENEGOSIDA), Fine Gold (24K) is priced at Rs ${fineGoldTola.toLocaleString('en-IN')} per tola and Rs ${fineGold10G.toLocaleString('en-IN')} per 10 grams today.`,
    },
    {
      qNe: '१ तोला सुनमा कति ग्राम हुन्छ?',
      qEn: 'How many grams are in 1 tola of gold in Nepal?',
      aNe: 'नेपालमा १ तोला सुन बराबर ११.६६३८ ग्राम (लगभग ११.६६ ग्राम) हुन्छ। त्यस्तै १० ग्राम सुन बराबर ०.८५७३ तोला हुन्छ। १ तोलामा १६ आना र ६४ लाल हुन्छ।',
      aEn: 'In Nepal and South Asia, 1 tola is standardized to 11.6638 grams (approx. 11.66g). Conversely, 10 grams of gold equals 0.8573 tola. 1 tola consists of 16 aana and 64 lal.',
    },
    {
      qNe: 'छापावाल सुन र तेजाबी सुनमा के फरक हुन्छ?',
      qEn: 'What is the difference between Fine Gold and Tejabi Gold?',
      aNe: 'छापावाल सुन (Hallmarked Fine Gold) २४ क्यारेट अर्थात् ९९.९% शुद्ध सुन हो। तेजाबी सुन (Tejabi Gold) २२ क्यारेट अर्थात् ९१.६% शुद्ध सुन हो जसमा केही मात्रामा तामा वा चाँदी मिसाइएको हुन्छ। नेपालमा तेजाबी सुन छापावालभन्दा प्रति तोला करिब रु १,००० कममा कारोबार हुन्छ।',
      aEn: 'Fine Gold (Chhapawal) is 24 Karat (99.9% pure gold). Tejabi Gold is 22 Karat (91.6% pure gold), containing small alloys for durability. In Nepal, Tejabi gold typically trades at approximately Rs 1,000 less per tola than 24K fine gold.',
    },
    {
      qNe: 'नेपालमा दैनिक सुनको भाउ कसले निर्धारण गर्छ?',
      qEn: 'Who determines the daily gold price in Nepal?',
      aNe: 'नेपालमा सुन र चाँदीको दैनिक भाउ "नेपाल सुनचाँदी व्यवसायी महासंघ" (FENEGOSIDA) ले अन्तर्राष्ट्रिय बजारको दर, अमेरिकी डलरको विनिमय दर, नेपाल राष्ट्र बैंकको आयात नीति र भन्सार महसुलको आधारमा प्रत्येक दिन बिहान १०:३० देखि ११:०० बजेको बीचमा निर्धारण गर्दछ।',
      aEn: "Daily gold and silver bullion prices in Nepal are determined by the Federation of Nepal Gold and Silver Dealers' Association (FENEGOSIDA) based on international London Bullion spot rates, USD exchange rates, customs duty, and import quotas set by Nepal Rastra Bank. Rates update daily between 10:30 AM and 11:00 AM.",
    },
  ]

  return (
    <div className="space-y-8">
      {/* 1. Refined Editorial Header Masthead */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {isNe ? 'आधिकारिक प्रत्यक्ष दर' : 'Official Live Rates'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {isNe ? 'स्रोत: नेपाल सुनचाँदी व्यवसायी महासंघ (FENEGOSIDA)' : 'Source: FENEGOSIDA Nepal'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              {isNe ? 'सुन र चाँदीको भाउ आज नेपालमा' : 'Gold & Silver Rate in Nepal Today'}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span suppressHydrationWarning>{isNe ? bsDate.fullNepaliDate : bsDate.fullEnglishDate}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{isNe ? 'काठमाडौँ बजार दर' : 'Kathmandu Bullion Market'}</span>
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

      {/* 2. Today's Core Bullion Rate Cards (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: 24K Fine Gold */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border-2 border-amber-500/50 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-white text-[11px] font-bold tracking-wide">
                {isNe ? '२४ क्यारेट (24K)' : '24 Karat (24K)'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-950 dark:text-white">
              {isNe ? 'छापावाल सुन' : 'Fine Gold (Hallmarked)'}
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              {isNe ? '९९.९% शुद्ध प्रमाणित सुन' : '99.9% Pure Certified Bullion'}
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                {isNe ? 'प्रति १ तोला (११.६६ ग्राम):' : 'Per 1 Tola (11.66g):'}
              </span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
                {isNe ? `रु ${toNepaliNumerals(fineGoldTola.toLocaleString('en-IN'))}` : `Rs ${fineGoldTola.toLocaleString('en-IN')}`}
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>{isNe ? 'प्रति १० ग्राम:' : 'Per 10 Grams:'}</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                {isNe ? `रु ${toNepaliNumerals(fineGold10G.toLocaleString('en-IN'))}` : `Rs ${fineGold10G.toLocaleString('en-IN')}`}
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs text-slate-500">
              <span>{isNe ? 'प्रति १ ग्राम:' : 'Per 1 Gram:'}</span>
              <span className="font-medium font-mono">
                {isNe ? `रु ${toNepaliNumerals(fineGold1G.toLocaleString('en-IN'))}` : `Rs ${fineGold1G.toLocaleString('en-IN')}`}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: 22K Tejabi Gold */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-amber-400/40 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                {isNe ? '२२ क्यारेट (22K)' : '22 Karat (22K)'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-950 dark:text-white">
              {isNe ? 'तेजाबी सुन' : 'Tejabi Gold'}
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              {isNe ? '९१.६% शुद्ध परम्परागत सुन' : '91.6% Pure Standard Gold'}
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                {isNe ? 'प्रति १ तोला (११.६६ ग्राम):' : 'Per 1 Tola (11.66g):'}
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {isNe ? `रु ${toNepaliNumerals(tejabiGoldTola.toLocaleString('en-IN'))}` : `Rs ${tejabiGoldTola.toLocaleString('en-IN')}`}
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>{isNe ? 'प्रति १० ग्राम:' : 'Per 10 Grams:'}</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                {isNe ? `रु ${toNepaliNumerals(tejabiGold10G.toLocaleString('en-IN'))}` : `Rs ${tejabiGold10G.toLocaleString('en-IN')}`}
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs text-slate-500">
              <span>{isNe ? 'प्रति १ ग्राम:' : 'Per 1 Gram:'}</span>
              <span className="font-medium font-mono">
                {isNe ? `रु ${toNepaliNumerals(tejabiGold1G.toLocaleString('en-IN'))}` : `Rs ${tejabiGold1G.toLocaleString('en-IN')}`}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Pure Silver */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-slate-400 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                {isNe ? 'शुद्ध चाँदी' : 'Pure Silver'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-950 dark:text-white">
              {isNe ? 'चाँदीको भाउ' : 'Silver Rate'}
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              {isNe ? '९९.९% शुद्ध चाँदी' : '99.9% Pure Silver Bullion'}
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                {isNe ? 'प्रति १ तोला (११.६६ ग्राम):' : 'Per 1 Tola (11.66g):'}
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {isNe ? `रु ${toNepaliNumerals(silverTola.toLocaleString('en-IN'))}` : `Rs ${silverTola.toLocaleString('en-IN')}`}
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>{isNe ? 'प्रति १० ग्राम:' : 'Per 10 Grams:'}</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                {isNe ? `रु ${toNepaliNumerals(silver10G.toLocaleString('en-IN'))}` : `Rs ${silver10G.toLocaleString('en-IN')}`}
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs text-slate-500">
              <span>{isNe ? 'प्रति १ ग्राम:' : 'Per 1 Gram:'}</span>
              <span className="font-medium font-mono">
                {isNe ? `रु ${toNepaliNumerals(silver1G.toLocaleString('en-IN'))}` : `Rs ${silver1G.toLocaleString('en-IN')}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Gold & Silver Value Calculator */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-950 dark:text-white">
              {isNe ? 'सुन तथा चाँदी क्यालकुलेटर' : 'Gold & Silver Price Calculator'}
            </h2>
            <p className="text-xs text-slate-500">
              {isNe
                ? 'वजन, क्यारेट र ज्यालाअनुसार तत्काल कुल मूल्य गणना गर्नुहोस्'
                : 'Calculate accurate prices based on weight, karat, and making charges'}
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: 7 cols */}
          <div className="lg:col-span-7 space-y-4">
            {/* Metal selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isNe ? 'धातु छान्नुहोस्' : 'Select Metal'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'fine', labelNe: 'छापावाल (24K)', labelEn: 'Fine (24K)' },
                  { id: 'tejabi', labelNe: 'तेजाबी (22K)', labelEn: 'Tejabi (22K)' },
                  { id: 'silver', labelNe: 'चाँदी (Silver)', labelEn: 'Silver' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCalcMetal(item.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer text-center ${
                      calcMetal === item.id
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {isNe ? item.labelNe : item.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Unit selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isNe ? 'तौल एकाइ (Unit)' : 'Weight Unit'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'tola', labelNe: 'तोला', labelEn: 'Tola' },
                  { id: 'gram', labelNe: 'ग्राम', labelEn: 'Gram' },
                  { id: 'aana', labelNe: 'आना', labelEn: 'Aana' },
                  { id: 'lal', labelNe: 'लाल', labelEn: 'Lal' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCalcUnit(item.id as any)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition border cursor-pointer text-center ${
                      calcUnit === item.id
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {isNe ? item.labelNe : item.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isNe ? 'परिमाण (Amount)' : 'Weight Amount'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-base font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  placeholder="1.0"
                />
                <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400 uppercase">
                  {calcUnit}
                </span>
              </div>

              {/* Quick weight chips */}
              <div className="flex items-center gap-1.5 mt-2">
                {['0.5', '1', '2', '5', '10'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCalcWeight(val)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                  >
                    {val} {calcUnit}
                  </button>
                ))}
              </div>
            </div>

            {/* Making Charge (%) Slider */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isNe ? 'ज्याला / जर्ती शुल्क' : 'Making & Wastage Charge'}
                </label>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  {calcMakingChargePct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={calcMakingChargePct}
                onChange={(e) => setCalcMakingChargePct(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>०% ({isNe ? 'काँचो सुन' : 'Raw Bullion'})</span>
                <span>१०% ({isNe ? 'सामान्य गहना' : 'Standard Jewelry'})</span>
                <span>२५% ({isNe ? 'डिजाइनर गहना' : 'Designer'})</span>
              </div>
            </div>
          </div>

          {/* Right Summary Invoice: 5 cols */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isNe ? 'मूल्य विवरण' : 'Price Summary'}
                </span>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                  {calcMetal.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{isNe ? 'तौल:' : 'Weight:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {calcWeight} {calcUnit}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{isNe ? 'ज्याला / जर्ती:' : 'Making charge:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {calcMakingChargePct}%
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <span className="block text-xs font-medium text-slate-500">
                  {isNe ? 'अनुमानित कुल रकम:' : 'Estimated Total Amount:'}
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-slate-950 dark:text-white tracking-tight mt-1">
                  {isNe ? `रु ${toNepaliNumerals(calculatedTotal.toLocaleString('en-IN'))}` : `Rs ${calculatedTotal.toLocaleString('en-IN')}`}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-start gap-2 text-[11px] text-slate-500 leading-normal">
              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>
                {isNe
                  ? 'नोट: पसल र डिजाइन अनुसार जर्ती र बनावट शुल्क थपघट हुन सक्छ।'
                  : 'Note: Actual charges may vary based on jeweler craftsmanship and design.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Nepal Weight Standard Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-black text-slate-950 dark:text-white">
            {isNe ? 'नेपालमा सुनको नाप-तौल तालिका' : 'Nepal Gold Weight Standard Table'}
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          {isNe
            ? 'नेपालमा सुन र चाँदी खरिद-बिक्री गर्दा प्रयोग हुने परम्परागत र आधुनिक एकाइहरू:'
            : 'Traditional vs metric units used for buying and selling gold in Nepal:'}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300">
                <th className="py-2.5 px-3 font-bold">{isNe ? 'इकाइ (Unit)' : 'Unit'}</th>
                <th className="py-2.5 px-3 font-bold">{isNe ? 'तौल (Weight in Grams)' : 'Grams'}</th>
                <th className="py-2.5 px-3 font-bold">{isNe ? 'अन्य एकाइमा रूपान्तरण' : 'Equivalent'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">१ तोला (1 Tola)</td>
                <td className="py-2.5 px-3 font-mono font-semibold text-amber-600 dark:text-amber-400">११.६६३८ ग्राम</td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">१६ आना = ६४ लाल</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">१० ग्राम (10 Grams)</td>
                <td className="py-2.5 px-3 font-mono font-semibold text-amber-600 dark:text-amber-400">१०.०००० ग्राम</td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">०.८५७३ तोला</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">१ आना (1 Aana)</td>
                <td className="py-2.5 px-3 font-mono font-semibold text-amber-600 dark:text-amber-400">०.७२९० ग्राम</td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">४ लाल = ०.०६२५ तोला</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">१ लाल (1 Lal)</td>
                <td className="py-2.5 px-3 font-mono font-semibold text-amber-600 dark:text-amber-400">०.१८२२ ग्राम</td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">०.०१५६ तोला</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Frequently Asked Questions (FAQ Accordions) */}
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

      {/* 6. Related Economy & Financial News Cross-Promotion */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-red-600">
            <h3 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-red-600" />
              <span>{isNe ? 'सम्बन्धित आर्थिक तथा बजार समाचार' : 'Related Economy & Market News'}</span>
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
