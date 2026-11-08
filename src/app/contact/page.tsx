import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getCategories } from '@/lib/data/categories'
import { getSiteSettings } from '@/lib/settings'
import { ContactForm } from '@/components/pages/contact-form'
import {
  FacebookIcon,
  TwitterXIcon,
  YoutubeIcon,
  InstagramIcon,
} from '@/components/ui/social-icons'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Building2,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Newspaper,
  Send,
  Sparkles,
} from 'lucide-react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabaichha.com'

export const metadata: Metadata = {
  title: 'सम्पर्क तथा सम्पादकीय (Contact Us) | SabaiChha.com - सबै छ डट कम',
  description:
    'सबै छ डट कमको केन्द्रीय कार्यालय, सम्पादकीय समाचार कक्ष, विज्ञापन शाखा तथा प्रादेशिक संवाददाताहरूसँग सिधै सम्पर्क गर्न आवश्यक फोन, इमेल र अनलाइन फारम।',
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: 'सम्पर्क तथा सम्पादकीय (Contact Us) | SabaiChha.com',
    description: 'हाम्रो समाचार कक्ष, सम्पादक तथा विज्ञापन शाखासँग सिधै सम्पर्क गर्नुहोस्।',
    url: `${SITE_URL}/contact`,
    type: 'website',
  },
}

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ])

  const { siteInfo, socialLinks } = settings

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
              <span className="text-white font-bold">सम्पर्क (Contact Us)</span>
            </nav>

            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 text-white text-[11px] sm:text-xs font-extrabold uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>समाचार कक्ष, सम्पादकीय तथा विज्ञापन शाखा</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                सम्पर्क गर्नुहोस् <span className="text-red-400 font-sans text-2xl sm:text-3xl font-bold">(Contact Us)</span>
              </h1>

              <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed font-medium">
                समाचार सूचना, विज्ञापन, सम्पादकीय टिप्पणी वा पाठक सुझावका लागि हामी सधैँ तयार छौं।
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* MAIN BODY: Quick Cards, Split Form & Department Directory */}
        {/* ========================================================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-10 sm:space-y-12">
          
          {/* Top 3 Quick-Contact Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Card 1: Address */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-sm transition space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#02267C] dark:text-blue-400 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">केन्द्रीय कार्यालय</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {siteInfo.addressNe || 'काठमाडौँ महानगरपालिका, बागमती प्रदेश, नेपाल'}
              </p>
            </div>

            {/* Card 2: Phone */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-sm transition space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">फोन तथा हटलाइन</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                मुख्य: {siteInfo.phone || '+977 1-4240000'}
                <br />
                <span className="text-[11px] text-slate-400">१०:०० - ५:०० (आइतबार-शुक्रबार)</span>
              </p>
            </div>

            {/* Card 3: Email */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-sm transition space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">आधिकारिक इमेल</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                {siteInfo.email || 'info@sabaichha.com'}
                <br />
                <span className="text-[11px] font-sans text-slate-400">२४ घण्टा भित्र जवाफ</span>
              </p>
            </div>
          </section>

          {/* Split Layout: Contact Form (Left 8) + Directory & Info (Right 4) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 8 Cols: Interactive Form */}
            <div className="lg:col-span-8">
              <ContactForm />
            </div>

            {/* Right 4 Cols: Departmental Directory & Details */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Department Directory Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                    विभागीय सम्पर्क तालिका
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Departmental Newsroom Contacts
                  </p>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Editorial Desk */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <p className="font-extrabold text-slate-900 dark:text-white">
                      सम्पादकीय शाखा (Editorial Bureau)
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      समाचार, विचार तथा लेख पठाउन:
                    </p>
                    <a
                      href="mailto:editor@sabaichha.com"
                      className="text-[#02267C] dark:text-blue-400 font-bold hover:underline inline-block font-mono"
                    >
                      editor@sabaichha.com
                    </a>
                  </div>

                  {/* Commercial & Advertising */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <p className="font-extrabold text-slate-900 dark:text-white">
                      विज्ञापन तथा बजारीकरण (Advertising & Sales)
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      ब्यानर, प्रायोजित सामग्री तथा मार्केटिङ:
                    </p>
                    <a
                      href="mailto:marketing@sabaichha.com"
                      className="text-red-600 dark:text-red-400 font-bold hover:underline inline-block font-mono"
                    >
                      marketing@sabaichha.com
                    </a>
                  </div>

                  {/* Grievance & Corrections */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <p className="font-extrabold text-slate-900 dark:text-white">
                      गुनासो तथा पाठक मञ्च (Reader Grievance)
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      समाचार सम्बन्धी तथ्य वा सुधारका लागि:
                    </p>
                    <a
                      href={`mailto:${siteInfo.email}`}
                      className="text-slate-700 dark:text-slate-300 font-bold hover:underline inline-block font-mono"
                    >
                      {siteInfo.email || 'info@sabaichha.com'}
                    </a>
                  </div>
                </div>
              </div>

              {/* Social Channels Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  सामाजिक सञ्जालमा जोडिनुहोस्
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ताजा अपडेटका लागि हाम्रा आधिकारिक सामाजिक खाताहरू फलो गर्नुहोस्:
                </p>

                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30 text-[#1877F2] hover:bg-blue-600 hover:text-white transition shadow-2xs group"
                    >
                      <FacebookIcon className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold truncate">Facebook</span>
                    </a>
                  )}

                  {socialLinks.twitter && (
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition shadow-2xs group"
                    >
                      <TwitterXIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs font-bold truncate">X / Twitter</span>
                    </a>
                  )}

                  {socialLinks.youtube && (
                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-red-500/20 bg-red-50/50 dark:bg-red-950/30 text-[#FF0000] hover:bg-red-600 hover:text-white transition shadow-2xs group"
                    >
                      <YoutubeIcon className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold truncate">YouTube</span>
                    </a>
                  )}

                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-pink-500/20 bg-pink-50/50 dark:bg-pink-950/30 text-[#E4405F] hover:bg-pink-600 hover:text-white transition shadow-2xs group"
                    >
                      <InstagramIcon className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold truncate">Instagram</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Office Hours / Location Helper */}
              <div className="bg-gradient-to-br from-slate-900 to-[#02267C] text-white rounded-3xl p-6 border border-slate-800 shadow-md space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>कार्यालय कार्य समय</span>
                </div>
                <p className="text-sm font-black">
                  आइतबार – शुक्रबार: बिहान १०:०० देखि साँझ ५:०० सम्म
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  अनलाइन समाचार सम्पादकीय डेस्क २४ घण्टा, सातै दिन निरन्तर सक्रिय रहन्छ।
                </p>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer categories={categories} />
    </div>
  )
}
