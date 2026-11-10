'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/context/language-context'
import { toNepaliNumerals } from '@/lib/utils/numerals'
import { transliterateRomanToNepali } from '@/lib/unicode/romanized-nepali'
import {
  Keyboard,
  Copy,
  Check,
  Trash2,
  Download,
  Share2,
  HelpCircle,
  Table,
  ArrowRight,
  ChevronDown,
  Newspaper,
  BookOpen,
} from 'lucide-react'

interface ArticleItem {
  id: string
  title: string
  slug: string
  featuredImage?: string | null
  publishedAt: string | null | Date
  category: { nameEn: string; nameNe: string; slug: string }
}

interface NepaliUnicodeClientProps {
  relatedArticles: ArticleItem[]
}

export function NepaliUnicodeClient({ relatedArticles }: NepaliUnicodeClientProps) {
  const { language } = useLanguage()
  const isNe = language === 'ne'

  const [inputText, setInputText] = React.useState<string>('')
  const [outputText, setOutputText] = React.useState<string>('')
  const [fontSize, setFontSize] = React.useState<'sm' | 'md' | 'lg'>('md')
  const [copied, setCopied] = React.useState<boolean>(false)
  const [openFaq, setOpenFaq] = React.useState<number | null>(0)
  const [showCheatSheet, setShowCheatSheet] = React.useState<boolean>(false)

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setInputText(val)
    setOutputText(transliterateRomanToNepali(val))
  }

  // Word and character count
  const charCount = outputText.length
  const wordCount = outputText.trim() ? outputText.trim().split(/\s+/).length : 0

  const handleCopy = () => {
    if (!outputText) return
    navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
  }

  const handleDownload = () => {
    if (!outputText) return
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sabaichha-nepali-unicode-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    if (!outputText) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'नेपाली युनिकोड - SabaiChha',
          text: outputText,
        })
      } catch {}
    } else {
      handleCopy()
    }
  }

  const loadExample = (ex: string) => {
    setInputText(ex)
    setOutputText(transliterateRomanToNepali(ex))
  }

  // FAQs
  const faqs = [
    {
      qNe: 'नेपाली युनिकोड के हो र यो परम्परागत फन्ट (Preeti) भन्दा कसरी फरक छ?',
      qEn: 'What is Nepali Unicode and how does it differ from traditional fonts like Preeti?',
      aNe: 'नेपाली युनिकोड अन्तर्राष्ट्रिय स्तरमा मान्य भएको कम्प्युटर क्यारेक्टर कोडिङ प्रणाली हो। परम्परागत प्रिती (Preeti) वा कान्तिपुर फन्ट भएको कम्प्युटरमा मात्र देखिन्छ, तर युनिकोड जुनसुकै मोबाइल, फेसबुक, गुगल सर्च, इमेल वा वेबसाइटमा फन्ट इन्स्टल नगरिकनै पढ्न र लेख्न सकिन्छ।',
      aEn: 'Nepali Unicode is a globally recognized digital character standard. Traditional fonts like Preeti require specialized fonts installed on each device. Nepali Unicode renders natively on all smartphones, Google Search, Facebook, and modern operating systems without installing any font.',
    },
    {
      qNe: 'रोमनबाट नेपाली टाइप कसरी गर्ने?',
      qEn: 'How to type in Nepali using English Roman letters?',
      aNe: 'हाम्रो टुलमा अंग्रेजी अक्षरहरूबाट उच्चारण अनुसार टाइप गर्नुहोस् (जस्तै: "namaste" टाइप गर्दा "नमस्ते" बन्छ, "nepal" टाइप गर्दा "नेपाल" बन्छ)। स्पेस बार थिच्दै जाँदा शब्द स्वतः नेपाली युनिकोडमा रूपान्तरण हुन्छ।',
      aEn: 'Simply type phonetically in English letters. For instance, typing "namaste" generates "नमस्ते", and "nepal" produces "नेपाल". Pressing the spacebar automatically formats and converts each word.',
    },
    {
      qNe: 'आधा अक्षर (ह्, क्, त्) कसरी लेख्ने?',
      qEn: 'How to write half letters and conjuncts in Romanized Unicode?',
      aNe: 'आधा अक्षर लेख्नका लागि व्यञ्जन अक्षरपछि "a" नलेख्नुहोस् (जस्तै: "k" = क्, "kt" = क्त)। संयुक्त अक्षरहरू: "ksha" = क्ष, "tra" = त्र, "gya" = ज्ञ, "shra" = श्र।',
      aEn: 'To write half-letters, omit the vowel "a" after the consonant (e.g. "k" = क्, "kt" = क्त). Special conjuncts: "ksha" = क्ष, "tra" = त्र, "gya" = ज्ञ, "shra" = श्र.',
    },
  ]

  const fontSizeClass =
    fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-xl' : 'text-base'

  return (
    <div className="space-y-8">
      {/* 1. Refined Editorial Header Masthead */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-500/20">
                <Keyboard className="w-3.5 h-3.5" />
                {isNe ? 'रोमन नेपाली युनिकोड' : 'Romanized Nepali Unicode'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {isNe ? '१-क्लिक कपी तथा डाउनलोड' : 'Instant 1-Click Copy & Download'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              {isNe ? 'नेपाली युनिकोड कन्भर्टर (Romanized Typing)' : 'Nepali Unicode Typing Converter'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {isNe
                ? 'अंग्रेजी किबोर्डबाट सजिलै शुद्ध नेपाली युनिकोड टाइप गर्नुहोस्। फेसबुक, इमेल, सरकारी फाराम र लोकसेवाका लागि १-क्लिक कपी सुविधा।'
                : 'Type naturally using English phonetics and convert to official Nepali Unicode. Supports 1-click copy, text download, and comprehensive character mapping.'}
            </p>

            {/* Quick example chips */}
            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">{isNe ? 'प्रयास गर्नुहोस्:' : 'Try:'}</span>
              {[
                { roman: 'namaste', nep: 'नमस्ते' },
                { roman: 'mero desh nepal', nep: 'मेरो देश नेपाल' },
                { roman: 'dhanyabad', nep: 'धन्यवाद' },
                { roman: 'shubhadin', nep: 'शुभदिन' },
              ].map((item) => (
                <button
                  key={item.roman}
                  type="button"
                  onClick={() => loadExample(item.roman)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] transition cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  {item.roman} ➔ {item.nep}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Typing Canvas Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
            <span>
              {isNe ? 'शब्द संख्या:' : 'Words:'}{' '}
              <strong className="text-slate-900 dark:text-white font-mono font-bold">
                {isNe ? toNepaliNumerals(wordCount) : wordCount}
              </strong>
            </span>
            <span>•</span>
            <span>
              {isNe ? 'अक्षर संख्या:' : 'Chars:'}{' '}
              <strong className="text-slate-900 dark:text-white font-mono font-bold">
                {isNe ? toNepaliNumerals(charCount) : charCount}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Font size toggles */}
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setFontSize('sm')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  fontSize === 'sm' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                अ-
              </button>
              <button
                type="button"
                onClick={() => setFontSize('md')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  fontSize === 'md' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                अ
              </button>
              <button
                type="button"
                onClick={() => setFontSize('lg')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  fontSize === 'lg' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                अ+
              </button>
            </div>

            {/* Cheat Sheet Toggle */}
            <button
              type="button"
              onClick={() => setShowCheatSheet((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{isNe ? 'टाइपिङ नियम' : 'Rules'}</span>
            </button>
          </div>
        </div>

        {/* Dual Input/Output Grid */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Roman Input Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {isNe ? '१. रोमन अंग्रेजी टाइप गर्नुहोस्' : '1. Type in English Roman'}
            </label>
            <textarea
              rows={9}
              value={inputText}
              onChange={handleInputChange}
              placeholder={isNe ? 'यहाँ अंग्रेजीमा टाइप गर्नुहोस् (उदा: mero desh nepal ho...)' : 'Type English phonetics here (e.g. namaste, mero desh nepal)...'}
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition resize-y"
            />
          </div>

          {/* Devanagari Output Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {isNe ? '२. रूपान्तरित नेपाली युनिकोड' : '2. Nepali Unicode Output'}
            </label>
            <div
              className={`w-full min-h-[220px] p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-slate-50 dark:bg-slate-800/50 text-slate-950 dark:text-white leading-relaxed select-text font-sans ${fontSizeClass} whitespace-pre-wrap transition`}
            >
              {outputText || (
                <span className="text-slate-400 italic text-sm">
                  {isNe ? 'नेपाली रूपान्तरण यहाँ स्वतः देखिनेछ...' : 'Nepali Unicode output will appear here automatically...'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!outputText}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isNe ? 'कपी गरियो!' : 'Copied!') : (isNe ? 'कपी गर्नुहोस्' : 'Copy Text')}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!outputText}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Download as .txt"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isNe ? 'डाउनलोड (.txt)' : 'Download'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              disabled={!outputText}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isNe ? 'साझा गर्नुहोस्' : 'Share'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleClear}
            disabled={!inputText && !outputText}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isNe ? 'हटाउनुहोस् (Clear)' : 'Clear All'}</span>
          </button>
        </div>
      </div>

      {/* 3. Character Mapping Cheat Sheet (Expandable) */}
      {showCheatSheet && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-black text-slate-950 dark:text-white">
              {isNe ? 'रोमन युनिकोड टाइपिङ नियम तथा क्यारेक्टर म्यापिङ' : 'Character Mapping Cheat Sheet'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Swar Vowels */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-[11px]">
                स्वर वर्ण (Vowels)
              </h4>
              <div className="space-y-1 font-mono text-slate-800 dark:text-slate-200">
                <div>a = अ, aa = आ</div>
                <div>i = इ, ee / I = ई</div>
                <div>u = उ, oo / U = ऊ</div>
                <div>e = ए, ai = ऐ</div>
                <div>o = ओ, au = औ</div>
                <div>am = अं, ah = अः</div>
              </div>
            </div>

            {/* Consonants 1 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-[11px]">
                व्यञ्जन (क - ञ)
              </h4>
              <div className="space-y-1 font-mono text-slate-800 dark:text-slate-200">
                <div>ka = क, kha = ख</div>
                <div>ga = ग, gha = घ</div>
                <div>nga = ङ</div>
                <div>cha = च, chha = छ</div>
                <div>ja = ज, jha = झ</div>
                <div>nya = ञ</div>
              </div>
            </div>

            {/* Consonants 2 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-[11px]">
                व्यञ्जन (ट - म)
              </h4>
              <div className="space-y-1 font-mono text-slate-800 dark:text-slate-200">
                <div>Ta = ट, Tha = ठ</div>
                <div>Da = ड, Dha = ढ</div>
                <div>ta = त, tha = थ</div>
                <div>da = द, dha = ध</div>
                <div>na = न, pa = प</div>
                <div>pha / fa = फ, ba = ब</div>
                <div>bha = भ, ma = म</div>
              </div>
            </div>

            {/* Special Conjuncts */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-[11px]">
                संयुक्त अक्षर (Conjuncts)
              </h4>
              <div className="space-y-1 font-mono text-slate-800 dark:text-slate-200">
                <div>ksha = क्ष</div>
                <div>tra = त्र</div>
                <div>gya = ज्ञ</div>
                <div>shra = श्र</div>
                <div>dya = द्य</div>
                <div>dwa = द्व</div>
                <div>0-9 = ०-९</div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  className="w-full p-3.5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                >
                  <span>{isNe ? faq.qNe : faq.qEn}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'
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
