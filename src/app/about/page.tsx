import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getCategories } from '@/lib/data/categories'
import { getSiteSettings } from '@/lib/settings'
import {
  ShieldCheck,
  Scale,
  Compass,
  Award,
  Globe2,
  Users2,
  FileCheck2,
  MapPin,
  Phone,
  Mail,
  Newspaper,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Building2,
  Radio,
  BookOpenCheck,
} from 'lucide-react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabaichha.com'

export const metadata: Metadata = {
  title: 'हाम्रो बारेमा (About Us) | SabaiChha.com - सबै छ डट कम',
  description:
    'सबै छ डट कम (SabaiChha.com) नेपालको अग्रणी डिजिटल अनलाइन पत्रिका हो। सूचना संवाद र मनोरञ्जनको संगम, निष्पक्ष समाचार, सम्पादकीय नीति र संस्थागत विवरण।',
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: 'हाम्रो बारेमा (About Us) | SabaiChha.com',
    description: 'सूचना संवाद र मनोरञ्जनको संगम - नेपालको आधिकारिक डिजिटल अनलाइन पत्रिका।',
    url: `${SITE_URL}/about`,
    type: 'website',
  },
}

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ])

  const { siteInfo } = settings

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header categories={categories} />

      <main className="flex-1">
        {/* ========================================================= */}
        {/* HERO SECTION: Professional Newsroom Branding Banner */}
        {/* ========================================================= */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#02267C] via-[#04339F] to-[#011B56] text-white py-14 sm:py-20 border-b-4 border-[#C10A1E]">
          {/* Subtle background graphic texture */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-blue-200 mb-6">
              <Link href="/" className="hover:text-white transition flex items-center gap-1">
                <span>गृहपृष्ठ</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-blue-300/70" />
              <span className="text-white font-bold">हाम्रो बारेमा (About Us)</span>
            </nav>

            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 text-white text-[11px] sm:text-xs font-extrabold uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>नेपालको आधिकारिक डिजिटल अनलाइन पत्रिका</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                हाम्रो बारेमा <span className="text-red-400 font-sans text-2xl sm:text-3xl font-bold">(About SabaiChha)</span>
              </h1>

              <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed font-medium">
                {siteInfo.sloganNe || 'सूचना संवाद र मनोरञ्जनको संगम, सबै छ डट कम'}
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* MAIN BODY: Mission, Pillars, Credentials & Newsroom */}
        {/* ========================================================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-12 sm:space-y-16">
          
          {/* 1. Introductory Narrative Card */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5 text-[#C10A1E]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                  परिचय तथा सम्पादकीय दृष्टिकोण
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Who We Are & Our Journalistic Vision
                </p>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 space-y-4">
              <p>
                <strong>सबै छ डट कम (SabaiChha.com)</strong> नेपालको सूचना प्रविधिमैत्री, भरपर्दो र जनसरोकार केन्द्रित आधुनिक डिजिटल अनलाइन पत्रिका हो। हामी राष्ट्रिय राजनीति, अर्थतन्त्र, समाज, विचार, खेलकुद, मनोरञ्जन, प्रविधि र समसामयिक वैश्विक विषयहरूमा निष्पक्ष, तथ्यपरक र खोजमूलक समाचारहरू चौबीसै घण्टा सम्प्रेषण गर्दै आएका छौं।
              </p>
              <p>
                नेपालको संघीय संरचनाअनुरूप देशका <strong>७ वटै प्रदेश</strong> (कोशी, मधेश, बागमती, गण्डकी, लुम्बिनी, कर्णाली र सुदूरपश्चिम) का दूरदराजदेखि सिंहदरबारसम्मका जनताका समस्या, विकास-निर्माण, सुशासन र आर्थिक रूपान्तरणका विषयहरूलाई प्राथमिकता दिनु हाम्रो सम्पादकीय दायित्व हो।
              </p>
              <p>
                हामी कुनै पनि राजनीतिक दल, व्यावसायिक स्वार्थ समूह वा दबाबबाट पूर्णतया मुक्त रही <strong>नेपालको संविधान</strong>, <strong>प्रेस काउन्सिल ऐन</strong> र <strong>पत्रकार आचारसंहिता</strong>को पूर्ण परिपालना गर्दै नागरिकको सुसूचित हुने अधिकारको रक्षा गर्न प्रतिबद्ध छौं।
              </p>
            </div>
          </section>

          {/* 2. Core Journalistic Pillars (4 Cards) */}
          <section className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400">
                सम्पादकीय मूल्य र मान्यता
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                हाम्रा चार मुख्य स्तम्भहरू
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Pillars that guide every story we research, write, and verify
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Pillar 1 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-red-500/40 transition group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <ShieldCheck className="w-6 h-6 text-[#02267C] dark:text-blue-400" />
                </div>
                <h3 className="text-base font-extrabold text-slate-950 dark:text-white mb-2">
                  तथ्यपरकता र शुद्धता
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  कुनै पनि समाचार प्रकाशन गर्नुपूर्व बहु-स्रोत परीक्षण, स्थलगत अध्ययन र आधिकारिक तथ्यहरूको सूक्ष्म छानबिन गर्दछौं।
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-red-500/40 transition group">
                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <Scale className="w-6 h-6 text-[#C10A1E]" />
                </div>
                <h3 className="text-base font-extrabold text-slate-950 dark:text-white mb-2">
                  निष्पक्षता र सन्तुलन
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  विवादास्पद विषयहरूमा सबै सरोकारवाला पक्षहरूको दृष्टिकोण समेटेर पाठकलाई निष्पक्ष निर्णय गर्ने अवसर प्रदान गर्दछौं।
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-red-500/40 transition group">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <Globe2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-base font-extrabold text-slate-950 dark:text-white mb-2">
                  समावेशी राष्ट्रिय आवाज
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  सबै भूगोल, भाषा, संस्कृति, समुदाय र विचारलाई उचित स्थान दिँदै राष्ट्रिय एकता र सामाजिक सद्भावलाई प्रवर्द्धन गर्दछौं।
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-red-500/40 transition group">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <Radio className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-base font-extrabold text-slate-950 dark:text-white mb-2">
                  द्रुत डिजिटल प्रविधि
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  लाइभ सेयर बजार, सुनचाँदी, मौसम, ई-पत्रिका तथा मोबाइल-मैत्री इन्टरफेसका माध्यमबाट आधुनिक पाठक अनुभव सिर्जना गर्दछौं।
                </p>
              </div>
            </div>
          </section>

          {/* 3. Editorial Ethics & Code of Conduct */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
                <BookOpenCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
                  सम्पादकीय आचारसंहिता तथा तथ्य जाँच नीति
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Code of Journalistic Conduct & Fact-Checking Commitment
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  <span>स्रोतको गोपनीयता र संरक्षण</span>
                </h4>
                <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                  सार्वजनिक हितका लागि सूचना दिने स्रोतहरूको सुरक्षा र गोपनीयताको पूर्ण सम्मान गरिन्छ।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  <span>भूल सुधार (Correction Policy)</span>
                </h4>
                <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                  कुनै समाचारमा प्राविधिक वा तथ्यगत त्रुटि देखिएमा तुरुन्तै स्पष्टीकरणसहित पारदर्शी सुधार गरिन्छ।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  <span>मानवअधिकार र सामाजिक मर्यादा</span>
                </h4>
                <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                  कसैको व्यक्तिगत मर्यादा, बालबालिकाको गोपनीयता र लैङ्गिक समानतामा आँच आउने सामग्री प्रकाशन गरिँदैन।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  <span>विज्ञापन र समाचारको पृथकीकरण</span>
                </h4>
                <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                  प्रायोजित वा विज्ञापनमूलक सामग्रीलाई स्पष्ट रूपमा पहिचान खुलाई सम्पादकीय समाचारबाट अलग राखिन्छ।
                </p>
              </div>
            </div>
          </section>

          {/* 5. Call To Action Ribbon */}
          <section className="bg-gradient-to-r from-red-600 to-[#C10A1E] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-black">
                समाचार सुझाव वा प्रतिक्रिया छ?
              </h3>
              <p className="text-xs sm:text-sm text-red-100 max-w-xl">
                हाम्रो समाचार कक्षलाई सुझाव पठाउन वा विज्ञापनसम्बन्धी सोधपुछका लागि सिधै सम्पर्क गर्नुहोस्।
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/contact"
                className="px-6 py-3 rounded-full bg-white text-[#C10A1E] hover:bg-slate-100 font-extrabold text-xs shadow-md transition flex items-center gap-2 group cursor-pointer"
              >
                <span>सम्पर्क गर्नुहोस् (Contact Us)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </section>

        </div>
      </main>

      <Footer categories={categories} />
    </div>
  )
}
