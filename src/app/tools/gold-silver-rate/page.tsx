import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { GoldSilverClient } from '@/components/tools/gold-silver-client'
import { getAggregatedMarketWeatherData } from '@/lib/market/market-service'
import { prisma } from '@/lib/prisma'
import { ArticleStatus } from '@prisma/client'
import { formatBikramSambat } from '@/lib/date/nepali-calendar'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const bsDate = formatBikramSambat(new Date())

  return {
    title: `सुनको भाउ आज नेपालमा (${bsDate.shortNepaliDate}) - Gold Rate in Nepal Today | SabaiChha`,
    description: `आज ${bsDate.shortNepaliDate} को आधिकारिक ताजा सुनचाँदी दर: २४ क्यारेट छापावाल सुन, २२ क्यारेट तेजाबी सुन र चाँदीको प्रति तोला र १० ग्रामको भाउ, र प्रत्यक्ष सुन क्यालकुलेटर।`,
    keywords: [
      'सुनको भाउ आज',
      'gold price in nepal today',
      'gold rate nepal',
      'aaja ko sun ko vau',
      'silver price nepal',
      'fenegosida rate',
      'nepal gold calculator',
      'छापावाल सुन दर',
    ],
    openGraph: {
      title: `सुनको भाउ आज नेपालमा - Gold Rate Today | SabaiChha.com`,
      description: `नेपाल सुनचाँदी व्यवसायी महासंघ (FENEGOSIDA) को आधिकारिक ताजा सुन र चाँदीको भाउ। प्रति तोला र १० ग्राम दर सहित प्रत्यक्ष क्यालकुलेटर।`,
      url: 'https://sabaichha.com/tools/gold-silver-rate',
      siteName: 'SabaiChha.com',
      locale: 'ne_NP',
      type: 'website',
    },
    alternates: {
      canonical: 'https://sabaichha.com/tools/gold-silver-rate',
    },
  }
}

export default async function GoldSilverRatePage() {
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

  // Extract raw numbers from market data
  const rawGoldStr = (marketData?.market.goldEn || '2,74,300').replace(/,/g, '')
  const rawSilverStr = (marketData?.market.silverEn || '3,720').replace(/,/g, '')

  const initialGold = parseInt(rawGoldStr, 10) || 274300
  const initialSilver = parseInt(rawSilverStr, 10) || 3720

  // JSON-LD Structured Data for Google Rich Snippets
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
            name: 'सुनचाँदीको भाउ (Gold & Silver Rate)',
            item: 'https://sabaichha.com/tools/gold-silver-rate',
          },
        ],
      },
      {
        '@type': 'WebApplication',
        name: 'Nepal Gold & Silver Rate Calculator',
        url: 'https://sabaichha.com/tools/gold-silver-rate',
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
            name: 'आज नेपालमा छापावाल सुनको भाउ कति छ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `आज नेपाल सुनचाँदी व्यवसायी महासंघ (FENEGOSIDA) को आधिकारिक दर अनुसार छापावाल सुन प्रति तोला रु ${initialGold.toLocaleString('en-IN')} कायम भएको छ।`,
            },
          },
          {
            '@type': 'Question',
            name: '१ तोला सुनमा कति ग्राम हुन्छ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'नेपालमा १ तोला सुन बराबर ११.६६३८ ग्राम हुन्छ। त्यस्तै १० ग्राम सुन बराबर ०.८५७३ तोला हुन्छ।',
            },
          },
          {
            '@type': 'Question',
            name: 'छापावाल सुन र तेजाबी सुनमा के फरक छ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'छापावाल सुन २४ क्यारेट (९९.९% शुद्ध) हुन्छ भने तेजाबी सुन २२ क्यारेट (९१.६% शुद्ध) हुन्छ।',
            },
          },
          {
            '@type': 'Question',
            name: 'नेपालमा दैनिक सुनको भाउ कसले निर्धारण गर्छ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'नेपालमा दैनिक सुनको भाउ नेपाल सुनचाँदी व्यवसायी महासंघ (FENEGOSIDA) ले निर्धारण गर्दछ।',
            },
          },
        ],
      },
    ],
  }

  return (
    <>
      {/* Schema.org Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header categories={categories} />

      <main className="min-h-screen bg-slate-50 dark:bg-[#060A12] py-6 sm:py-10 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <GoldSilverClient
            initialGoldRate={initialGold}
            initialSilverRate={initialSilver}
            lastUpdated={marketData?.lastUpdated || new Date().toISOString()}
            relatedArticles={relatedArticles}
          />
        </div>
      </main>

      <Footer />
    </>
  )
}
