import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ForexConverterClient } from '@/components/tools/forex-converter-client'
import { getAggregatedMarketWeatherData } from '@/lib/market/market-service'
import { computeAllForexRates } from '@/lib/market/forex-service'
import { prisma, ArticleStatus } from '@/lib/prisma'
import { formatBikramSambat } from '@/lib/date/nepali-calendar'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const bsDate = formatBikramSambat(new Date())

  return {
    title: `विदेशी मुद्रा विनिमय दर (${bsDate.shortNepaliDate}) - NRB Forex Rates Today | SabaiChha`,
    description: `आज ${bsDate.shortNepaliDate} को आधिकारिक नेपाल राष्ट्र बैंक (NRB) विदेशी मुद्रा विनिमय दर: अमेरिकी डलर, कतारी रियाल, साउदी रियाल, युएई दिर्हाम, युरो, पाउन्ड खरिद र बिक्री दर तथा प्रत्यक्ष मुद्रा रूपान्तरक।`,
    keywords: [
      'विदेशी मुद्रा विनिमय दर',
      'nrb forex rate today',
      'dollar rate in nepal today',
      'qatar riyal to npr',
      'saudi riyal npr rate',
      'uae dirham in nepal',
      'nepal rastra bank exchange rate',
      'currency converter nepal',
    ],
    openGraph: {
      title: 'आजको विदेशी मुद्रा विनिमय दर | NRB Forex Rates Nepal',
      description:
        'नेपाल राष्ट्र बैंकको आधिकारिक दैनिक विदेशी मुद्रा विनिमय दर र तत्काल मुद्रा रूपान्तरण क्यालकुलेटर।',
      url: 'https://sabaichha.com/tools/forex-converter',
      siteName: 'SabaiChha.com',
      locale: 'ne_NP',
      type: 'website',
    },
    alternates: {
      canonical: 'https://sabaichha.com/tools/forex-converter',
    },
  }
}

export default async function ForexConverterPage() {
  const [marketData, relatedArticles, categories] = await Promise.all([
    getAggregatedMarketWeatherData().catch(() => null),
    prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        category: { slug: 'economy' },
      },
      take: 4,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: { select: { nameEn: true, nameNe: true, slug: true } },
      },
    }),
    prisma.category.findMany({
      where: { showInMenu: true },
      orderBy: { orderIndex: 'asc' },
      select: { id: true, nameEn: true, nameNe: true, slug: true },
    }),
  ])

  // Extract raw USD rate
  const rawUsdStr = (marketData?.market.usdEn || '152.03').replace(/,/g, '')
  const rawUsdNum = parseFloat(rawUsdStr) || 152.03
  const allRates = computeAllForexRates(rawUsdNum)

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'गृहपृष्ठ (Home)',
            item: 'https://sabaichha.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'उपयोगी टुल्स (Tools)',
            item: 'https://sabaichha.com/tools',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'विदेशी मुद्रा विनिमय दर (Forex Rates)',
            item: 'https://sabaichha.com/tools/forex-converter',
          },
        ],
      },
      {
        '@type': 'WebApplication',
        name: 'Nepal Rastra Bank Currency Converter',
        url: 'https://sabaichha.com/tools/forex-converter',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'NPR',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'नेपालमा विदेशी मुद्रा विनिमय दर कसले निर्धारण गर्छ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'नेपालमा विदेशी मुद्राको दैनिक विनिमय दर नेपाल राष्ट्र बैंक (NRB) ले निर्धारण गर्दछ।',
            },
          },
          {
            '@type': 'Question',
            name: 'खरिद दर र बिक्री दरमा के फरक हुन्छ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'खरिद दर बैंकले विदेशी मुद्रा किन्दा दिने मूल्य हो भने बिक्री दर बैंकले विदेशी मुद्रा बेच्दा लिने मूल्य हो।',
            },
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header categories={categories} />

      <main className="min-h-screen bg-slate-50 dark:bg-[#060A12] py-6 sm:py-10 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ForexConverterClient
            rates={allRates}
            usdRate={rawUsdNum}
            lastUpdated={marketData?.lastUpdated || new Date().toISOString()}
            relatedArticles={relatedArticles}
          />
        </div>
      </main>

      <Footer />
    </>
  )
}
