import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { DateConverterClient } from '@/components/tools/date-converter-client'
import { prisma, ArticleStatus } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'नेपाली मिति रूपान्तरक (Nepali Date Converter B.S. to A.D.) | SabaiChha',
  description:
    'नेपाली मिति (वि.सं.) बाट अंग्रेजी (ई.सं.) र अंग्रेजीबाट नेपालीमा तत्काल सही मिति रूपान्तरण गर्नुहोस्। सरकारी कागजात, राहदानी, भिसा र उमेर गणनाका लागि आधिकारिक टुल।',
  keywords: [
    'nepali date converter',
    'miti converter',
    'bs to ad converter',
    'ad to bs converter',
    'nepali calendar converter',
    'aaja ko miti',
    'bikram sambat date converter',
    'nepali age calculator',
  ],
  openGraph: {
    title: 'नेपाली मिति रूपान्तरक (वि.सं. ⇄ ई.सं.) | SabaiChha.com',
    description:
      'विक्रम संवत् (वि.सं.) र ईस्वी संवत् (ई.सं.) बीच तत्काल दुई-तर्फी मिति रूपान्तरण र उमेर क्यालकुलेटर।',
    url: 'https://sabaichha.com/tools/date-converter',
    siteName: 'SabaiChha.com',
    locale: 'ne_NP',
    type: 'website',
  },
  alternates: {
    canonical: 'https://sabaichha.com/tools/date-converter',
  },
}

export default async function DateConverterPage() {
  const [categories, relatedArticles] = await Promise.all([
    prisma.category.findMany({
      where: { showInMenu: true },
      orderBy: { orderIndex: 'asc' },
      select: { id: true, nameEn: true, nameNe: true, slug: true },
    }),
    prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      take: 4,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: { select: { nameEn: true, nameNe: true, slug: true } },
      },
    }),
  ])

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
            name: 'नेपाली मिति रूपान्तरक (Date Converter)',
            item: 'https://sabaichha.com/tools/date-converter',
          },
        ],
      },
      {
        '@type': 'WebApplication',
        name: 'Nepali Date Converter (B.S. to A.D.)',
        url: 'https://sabaichha.com/tools/date-converter',
        applicationCategory: 'UtilityApplication',
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
            name: 'विक्रम संवत् (वि.सं.) र ईस्वी संवत् (ई.सं.) मा कति फरक छ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'विक्रम संवत् (B.S.) नेपालको आधिकारिक राष्ट्रिय पात्रो हो। यो ईस्वी संवत् (A.D.) भन्दा लगभग ५६ वर्ष, ८ महिना र १५–१७ दिन अगाडि रहन्छ।',
            },
          },
          {
            '@type': 'Question',
            name: 'सरकारी कागजात र भिसा आवेदनमा मिति रूपान्तरण कसरी गर्ने?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'राहदानी र भिसाका लागि अंग्रेजी मिति (A.D.) अनिवार्य हुन्छ। हाम्रो मिति रूपान्तरक टुल प्रयोग गरी नागरिकताको वि.सं. मितिलाई तत्काल अंग्रेजीमा रूपान्तरण गर्न सकिन्छ।',
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
          <DateConverterClient relatedArticles={relatedArticles} />
        </div>
      </main>

      <Footer />
    </>
  )
}
