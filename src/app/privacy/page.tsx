import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getCategories } from '@/lib/data/categories'
import { getSiteSettings } from '@/lib/settings'
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Cookie,
  Database,
  UserCheck,
  FileText,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Sparkles,
  Scale,
} from 'lucide-react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabaichha.com'

export const metadata: Metadata = {
  title: 'गोपनीयता नीति (Privacy Policy) | SabaiChha.com - सबै छ डट कम',
  description:
    'सबै छ डट कम (SabaiChha.com) को गोपनीयता नीति। नेपालको वैयक्तिक गोपनीयता ऐन, २०७५ अनुसार पाठकहरूको व्यक्तिगत विवरणको सुरक्षा, कुकीज प्रयोग र अधिकार सम्बन्धी आधिकारिक दस्तावेज।',
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  openGraph: {
    title: 'गोपनीयता नीति (Privacy Policy) | SabaiChha.com',
    description: 'नेपालको वैयक्तिक गोपनीयता ऐन, २०७५ बमोजिम पाठकको डाटा सुरक्षा र अधिकार सम्बन्धी पूर्ण नीति।',
    url: `${SITE_URL}/privacy`,
    type: 'website',
  },
}

export const revalidate = 3600

export default async function PrivacyPage() {
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
        {/* HERO SECTION */}
        {/* ========================================================= */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#02267C] via-[#04339F] to-[#011B56] text-white py-14 sm:py-20 border-b-4 border-[#C10A1E]">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-blue-200 mb-6">
              <Link href="/" className="hover:text-white transition flex items-center gap-1">
                <span>गृहपृष्ठ</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-blue-300/70" />
              <span className="text-white font-bold">गोपनीयता नीति (Privacy Policy)</span>
            </nav>

            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/90 text-white text-[11px] sm:text-xs font-extrabold uppercase tracking-wider shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>वैयक्तिक गोपनीयता सम्बन्धी ऐन, २०७५ अनुरूप</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                गोपनीयता नीति <span className="text-red-400 font-sans text-2xl sm:text-3xl font-bold">(Privacy Policy)</span>
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-blue-100/90 font-medium">
                <span>पछिल्लो परिमार्जन: सन् २०२६</span>
                <span>•</span>
                <span>SabaiChha.com</span>
                <span>•</span>
                <span className="text-emerald-300 font-bold">सुरक्षित तथा गोपनीय</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* MAIN BODY */}
        {/* ========================================================= */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-8 sm:space-y-10">
          
          {/* Executive Overview Banner */}
          <div className="p-5 sm:p-6 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border-l-4 border-[#02267C] dark:border-blue-500 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-2">
            <p className="font-extrabold text-[#02267C] dark:text-blue-400 text-sm sm:text-base">
              हाम्रो दृढ प्रतिबद्धता (Our Privacy Commitment):
            </p>
            <p>
              <strong>सबै छ डट कम (SabaiChha.com)</strong> आफ्ना सम्पूर्ण पाठक, प्रयोगकर्ता तथा विज्ञापनदाताहरूको गोपनीयतालाई सर्वोच्च प्राथमिकता दिन्छ। हामी नेपालको संविधान, <strong>वैयक्तिक गोपनीयता सम्बन्धी ऐन, २०७५</strong> र प्रचलित डिजिटल गोपनीयता निर्देशिका अनुसार तपाईंको व्यक्तिगत डेटाको सुरक्षा गर्न पूर्ण प्रतिबद्ध छौं।
            </p>
          </div>

          {/* Policy Clauses */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-10">
            
            {/* Clause 1 */}
            <section className="space-y-3 pb-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold text-sm">
                  १
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
                  हामीले संकलन गर्ने जानकारी (Information We Collect)
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 pl-11">
                <p>
                  सबै छ डट कम प्रयोग गर्दा हामी दुई प्रकारका जानकारी संकलन गर्न सक्छौं:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>स्वेच्छिक व्यक्तिगत विवरण:</strong> जब तपाईं पोर्टलमा प्रतिक्रिया (Comment) पोस्ट गर्नुहुन्छ, सम्पर्क फारम भर्नुहुन्छ, वा समाचार सुझाव पठाउनुहुन्छ—हामी तपाईंले प्रविष्ट गर्नुभएको नाम, इमेल ठेगाना र फोन नम्बर संकलन गर्दछौं।
                  </li>
                  <li>
                    <strong>स्वचालित प्राविधिक तथ्यांक:</strong> तपाईंको डिभाइसको प्रकार, इन्टरनेट ब्राउजर, स्क्रिन रिजोल्युसन, अपरेटिङ सिस्टम, भ्रमण गरिएका पृष्ठहरू र आईपी ठेगाना (सामान्य भौगोलिक क्षेत्र र सुरक्षा प्रयोजनका लागि मात्र)।
                  </li>
                </ul>
              </div>
            </section>

            {/* Clause 2 */}
            <section className="space-y-3 pb-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#02267C] dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  २
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
                  जानकारीको उपयोग र प्रयोजन (How We Use Your Data)
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 pl-11">
                <p>संकलित जानकारी निम्न प्रयोजनका लागि मात्र प्रयोग गरिन्छ:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>पोर्टलको प्राविधिक गति, कार्यक्षमता र समाचार प्रस्तुतिलाई प्रभावकारी बनाउन।</li>
                  <li>तपाईंको भाषा प्राथमिकता (नेपाली वा अङ्ग्रेजी) र थिम (लाइट वा डार्क मोड) सुरक्षित राख्न।</li>
                  <li>तपाईंले सुरक्षित राख्नुभएका अफलाइन समाचारहरू (Saved Bookmarks) तपाईंको डिभाइसमा पुनः प्रदर्शन गर्न।</li>
                  <li>पाठकका जिज्ञासा, गुनासो वा समाचार सुझावहरूको आधिकारिक जवाफ सम्प्रेषण गर्न।</li>
                  <li>साइबर सुरक्षा जोखिम, स्प्याम तथा अनाधिकृत गतिविधिहरू रोकथाम गर्न।</li>
                </ul>
              </div>
            </section>

            {/* Clause 3 */}
            <section className="space-y-3 pb-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  ३
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
                  कुकीज तथा स्थानीय भण्डारण नीति (Cookies & Local Storage)
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 pl-11">
                <p>
                  हामी प्रयोगकर्ताको अनुभव सहज बनाउन ब्राउजरको <code>Cookies</code> र <code>localStorage</code> को न्यूनतम प्रयोग गर्दछौं:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>प्राथमिकता कुकीज:</strong> नेपाली वा अंग्रेजी भाषा छनोट तथा डार्क मोड चयन याद राख्न।
                  </li>
                  <li>
                    <strong>बुकमार्क स्टोरेज:</strong> तपाईंका सुरक्षित लेखहरू तपाईंको व्यक्तिगत डिभाइसमा मात्र रहन्छन्, हाम्रो सर्भरमा अपलोड हुँदैनन्।
                  </li>
                  <li>
                    तपाईं चाहेको समयमा आफ्नो ब्राउजर सेटिङ्सबाट कुकीज मेटाउन वा बन्द गर्न स्वतन्त्र हुनुहुन्छ।
                  </li>
                </ul>
              </div>
            </section>

            {/* Clause 4 */}
            <section className="space-y-3 pb-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold text-sm">
                  ४
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
                  तेस्रो पक्षका सेवा तथा विज्ञापन (Third-Party Services & Ads)
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 pl-11">
                <p>
                  हाम्रो पोर्टलमा गुगल एडसेन्स (Google AdSense), सामाजिक सञ्जालका इम्बेडहरू (Facebook, X, YouTube) तथा ट्राफिक विश्लेषणका उपकरणहरू प्रयोग हुन सक्छन्। ती सेवा प्रदायकहरूले आफ्नै गोपनीयता नीतिअनुसार अज्ञात प्राविधिक डेटा प्रयोग गर्न सक्छन्।
                </p>
                <p>
                  हामी कुनै पनि विज्ञापनदाता वा बाह्य निकायलाई पाठकको निजी विवरण (जस्तै: नाम, फोन वा इमेल) बिक्री वा हस्तान्तरण <strong>कदापि गर्दैनौं</strong>।
                </p>
              </div>
            </section>

            {/* Clause 5 */}
            <section className="space-y-3 pb-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold text-sm">
                  ५
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
                  डेटा सुरक्षा तथा इन्क्रिप्सन (Data Security & SSL)
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 pl-11">
                <p>
                  सबै छ डट कममा सम्प्रेषण हुने सम्पूर्ण डेटा आधुनिक <strong>SSL/TLS (HTTPS) २६४-बिट इन्क्रिप्सन</strong> प्रविधिद्वारा सुरक्षित गरिएको छ। हाम्रो सर्भर संरचनामा सुरक्षित फायरवाल, नियन्त्रित पहुँच र नियमित सुरक्षा अडिट व्यवस्था गरिएको छ।
                </p>
              </div>
            </section>

            {/* Clause 6 */}
            <section className="space-y-3 pb-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center font-bold text-sm">
                  ६
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
                  पाठकका कानुनी अधिकार (Your Legal Rights)
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 pl-11">
                <p>
                  नेपालको वैयक्तिक गोपनीयता ऐन बमोजिम पाठकहरूलाई निम्न अधिकार प्राप्त छ:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>हाम्रो प्रणालीमा रहेको आफ्नो व्यक्तिगत विवरणबारे जानकारी माग्ने अधिकार।</li>
                  <li>त्रुटिपूर्ण विवरण सच्याउन वा हटाउन अनुरोध गर्ने अधिकार।</li>
                  <li>आफूले पोस्ट गरेका टिप्पणी (Comments) मेटाउन सम्पादकीय शाखामा निवेदन दिने अधिकार।</li>
                </ul>
              </div>
            </section>

            {/* Clause 7 */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  ७
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
                  गोपनीयता अधिकृत तथा सम्पर्क (Privacy Grievance Officer)
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 pl-11">
                <p>
                  गोपनीयता नीति वा व्यक्तिगत विवरण सम्बन्धी कुनै पनि जिज्ञासा वा गुनासो भएमा हाम्रो आधिकारिक गोपनीयता डेस्कमा सम्पर्क गर्न सक्नुहुन्छ:
                </p>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 font-medium">
                  <p className="font-extrabold text-slate-950 dark:text-white">
                    गोपनीयता तथा डेटा संरक्षण शाखा (Privacy & Grievance Desk)
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    सबै छ डट कम (SabaiChha.com)
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    ठेगाना: {siteInfo.addressNe || 'काठमाडौँ महानगरपालिका, बागमती प्रदेश, नेपाल'}
                  </p>
                  <p className="font-mono text-slate-700 dark:text-slate-300">
                    इमेल: <a href={`mailto:${siteInfo.email}`} className="text-[#02267C] dark:text-blue-400 font-bold hover:underline">{siteInfo.email || 'info@sabaichha.com'}</a>
                  </p>
                  <p className="font-mono text-slate-700 dark:text-slate-300">
                    फोन: {siteInfo.phone || '+977 1-4240000'}
                  </p>
                </div>
              </div>
            </section>

          </div>

        </div>
      </main>

      <Footer categories={categories} />
    </div>
  )
}
