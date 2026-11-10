import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { prisma } from '@/lib/prisma'
import { getAggregatedMarketWeatherData } from '@/lib/market/market-service'
import { formatBikramSambat } from '@/lib/date/nepali-calendar'
import {
  Coins,
  Calendar,
  DollarSign,
  Keyboard,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Shield,
  CheckCircle,
} from 'lucide-react'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'उपयोगी अनलाइन टुल्स तथा सामग्रीहरू (Utility Tools) | SabaiChha',
  description:
    'नेपालका लागि उपयोगी अनलाइन टुल्सहरू: सुनचाँदीको भाउ, नेपाली मिति रूपान्तरक (वि.सं. ⇄ ई.सं.), नेपाल राष्ट्र बैंक विदेशी मुद्रा विनिमय दर, नेपाली युनिकोड र दैनिक राशिफल।',
  keywords: [
    'utility tools nepal',
    'nepali tools online',
    'gold rate nepal',
    'nepali date converter',
    'forex rate nepal',
    'nepali unicode typing',
    'rashifal nepal',
    'उपयोगी टुल्स',
  ],
  openGraph: {
    title: 'उपयोगी अनलाइन टुल्स तथा सामग्रीहरू | SabaiChha.com',
    description: 'दैनिक जीवनका लागि आवश्यक सम्पूर्ण नेपाली अनलाइन टुल्सहरू एकै ठाउँमा।',
    url: 'https://sabaichha.com/tools',
    siteName: 'SabaiChha.com',
    locale: 'ne_NP',
    type: 'website',
  },
  alternates: {
    canonical: 'https://sabaichha.com/tools',
  },
}

export default async function ToolsDirectoryPage() {
  const [categories, marketData] = await Promise.all([
    prisma.category.findMany({
      where: { showInMenu: true },
      orderBy: { orderIndex: 'asc' },
      select: { id: true, nameEn: true, nameNe: true, slug: true },
    }),
    getAggregatedMarketWeatherData().catch(() => null),
  ])

  const bsDate = formatBikramSambat(new Date())
  const gold = marketData?.market.gold || '२,७४,३००'
  const silver = marketData?.market.silver || '३,४५०'
  const usd = marketData?.market.usd || '१५२.०३'

  const marketHighlights = [
    {
      label: 'छापावाल सुन (२४ क्यारेट)',
      value: `रु ${gold}`,
      unit: 'प्रति तोला',
      badge: 'FENEGOSIDA',
      href: '/tools/gold-silver-rate',
      accent: 'border-amber-500/40 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'चाँदीको दर',
      value: `रु ${silver}`,
      unit: 'प्रति तोला',
      badge: 'ताजा दर',
      href: '/tools/gold-silver-rate',
      accent: 'border-slate-400/40 text-slate-700 dark:text-slate-300',
    },
    {
      label: 'अमेरिकी डलर (USD)',
      value: `रु ${usd}`,
      unit: 'राष्ट्र बैंक खरिद दर',
      badge: 'NRB',
      href: '/tools/forex-converter',
      accent: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'आजको नेपाली मिति',
      value: bsDate.shortNepaliDate,
      unit: bsDate.weekday,
      badge: 'वि.सं.',
      href: '/tools/date-converter',
      accent: 'border-red-500/40 text-red-600 dark:text-red-400',
    },
  ]

  const tools = [
    {
      id: 'gold-silver',
      href: '/tools/gold-silver-rate',
      titleNe: 'सुन तथा चाँदीको भाउ',
      titleEn: 'Gold & Silver Rates & Calculator',
      descriptionNe:
        'नेपाल सुनचाँदी व्यवसायी महासंघको आधिकारिक छापावाल सुन, तेजाबी सुन र चाँदीको दैनिक दर, साथै तोला, आना, लाल र ग्राममा मूल्य हिसाब गर्ने क्यालकुलेटर।',
      icon: Coins,
      tag: 'प्रत्यक्ष दर',
      statLabel: 'छापावाल सुन',
      statValue: `रु ${gold} / तोला`,
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
      hoverAccent: 'hover:border-amber-400/60 dark:hover:border-amber-600/60',
    },
    {
      id: 'date-converter',
      href: '/tools/date-converter',
      titleNe: 'नेपाली मिति रूपान्तरक',
      titleEn: 'B.S. to A.D. Date Converter & Age Calc',
      descriptionNe:
        'विक्रम संवत् (वि.सं.) र अंग्रेजी (ई.सं.) बीच तत्काल दुई-तर्फी मिति रूपान्तरण। राहदानी, भिसा, सरकारी फाराम तथा उमेर गणनाका लागि उपयोगी।',
      icon: Calendar,
      tag: 'वि.सं. ⇄ ई.सं.',
      statLabel: 'आजको मिति',
      statValue: bsDate.shortNepaliDate,
      iconBg: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900',
      hoverAccent: 'hover:border-red-400/60 dark:hover:border-red-600/60',
    },
    {
      id: 'forex-converter',
      href: '/tools/forex-converter',
      titleNe: 'विदेशी मुद्रा विनिमय दर',
      titleEn: 'NRB Forex Rates & Currency Calculator',
      descriptionNe:
        'नेपाल राष्ट्र बैंकको आधिकारिक दैनिक विदेशी मुद्रा विनिमय दर: डलर, रियाल, दिर्हाम, युरो र पाउन्डको खरिद/बिक्री दर तथा तत्काल क्यालकुलेटर।',
      icon: DollarSign,
      tag: 'राष्ट्र बैंक दर',
      statLabel: '१ अमेरिकी डलर',
      statValue: `रु ${usd} (खरिद)`,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
      hoverAccent: 'hover:border-emerald-400/60 dark:hover:border-emerald-600/60',
    },
    {
      id: 'nepali-unicode',
      href: '/tools/nepali-unicode',
      titleNe: 'नेपाली युनिकोड टाइपिङ',
      titleEn: 'Romanized Nepali Unicode Converter',
      descriptionNe:
        'अंग्रेजी अक्षरमा टाइप गर्नुहोस् र तत्काल शुद्ध नेपाली युनिकोडमा पाउनुहोस्। सामाजिक सञ्जाल, इमेल, समाचार र कागजातका लागि १-क्लिक कपी सुविधा।',
      icon: Keyboard,
      tag: '१-क्लिक कपी',
      statLabel: 'टाइपिङ नियम',
      statValue: 'namaste ➔ नमस्ते',
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
      hoverAccent: 'hover:border-blue-400/60 dark:hover:border-blue-600/60',
    },
    {
      id: 'rashifal',
      href: '/rashifal',
      titleNe: 'आजको राशिफल (दैनिक फलादेश)',
      titleEn: 'Daily Rashifal & Horoscope',
      descriptionNe:
        'मेषदेखि मीनसम्म सम्पूर्ण १२ राशिको आजको दैनिक भाग्यफल। शुभ अंक, शुभ रंग, शुभ दिशा र नामको पहिलो अक्षरबाट राशि पत्ता लगाउने सुविधा।',
      icon: Sparkles,
      tag: '१२ वटै राशि',
      statLabel: 'दैनिक पञ्चाङ्ग',
      statValue: bsDate.weekday,
      iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-200 dark:border-purple-800',
      hoverAccent: 'hover:border-purple-400/60 dark:hover:border-purple-600/60',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header categories={categories} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {/* Section Masthead */}
        <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block" />
              <span className="font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                सबै छ अनलाइन सामग्री
              </span>
              <span>•</span>
              <span className="font-medium">Utility & Services Desk</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{bsDate.fullNepaliDate}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
                उपयोगी सामग्री तथा अनलाइन सेवाहरू
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
                दैनिक जीवन, व्यापार, वित्तीय कारोबार र अध्ययनका लागि आवश्यक आधिकारिक नेपाली अनलाइन टुल्सहरू।
              </p>
            </div>
          </div>
        </div>

        {/* Live Market Quickboard */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span>आजको बजार तथा मिति संक्षिप्त झलक</span>
            </span>
            <span className="text-[11px] text-slate-400 lowercase">live official rates</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketHighlights.map((m) => (
              <Link
                key={m.label}
                href={m.href}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:shadow-md transition flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">{m.label}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {m.badge}
                  </span>
                </div>

                <div className="py-2">
                  <div className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition font-mono">
                    {m.value}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{m.unit}</div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-red-600 dark:text-red-400 font-bold">
                  <span>विस्तृत हेर्नुहोस्</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Tools Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
              सम्पूर्ण सामग्री तथा टुल्स सूची
            </h2>
            <span className="text-xs text-slate-400 font-medium">५ उपयोगी सेवाहरू</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group ${tool.hoverAccent}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tool.iconBg} group-hover:scale-105 transition`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                        {tool.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-slate-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                        {tool.titleNe}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{tool.titleEn}</p>
                    </div>

                    {/* Stat Highlight Bar */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">{tool.statLabel}:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        {tool.statValue}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {tool.descriptionNe}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400">
                    <span>टुल प्रयोग गर्नुहोस्</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Official Data Source / Editorial Footer Notice */}
        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
            <Shield className="w-4 h-4 text-red-600" />
            <span>आधिकारिक स्रोतबाट प्रमाणित: नेपाल राष्ट्र बैंक र नेपाल सुनचाँदी व्यवसायी महासंघ</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>दैनिक बिहान स्वतः अद्यावधिक</span>
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>१००% निःशुल्क</span>
            </span>
          </div>
        </section>
      </main>

      <Footer categories={categories} />
    </div>
  )
}
