import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { RashifalClient } from '@/components/tools/rashifal-client'
import { getDailyRashifal } from '@/lib/horoscope/rashifal-service'
import { prisma, ArticleStatus } from '@/lib/prisma'
import { formatBikramSambat } from '@/lib/date/nepali-calendar'

export const revalidate = 1800

export async function generateMetadata(): Promise<Metadata> {
  const bsDate = formatBikramSambat(new Date())

  return {
    title: `आजको राशिफल (${bsDate.shortNepaliDate}) - Daily Rashifal Today | SabaiChha`,
    description: `आज ${bsDate.fullNepaliDate} को सम्पूर्ण १२ राशिको आधिकारिक दैनिक फलादेश: मेष, वृष, मिथुन, कर्कट, सिंह, कन्या, तुला, वृश्चिक, धनु, मकर, कुम्भ र मीन राशि। शुभ अंक, रंग र दिशा।`,
    keywords: [
      'आजको राशिफल',
      'aaja ko rashifal',
      'daily rashifal today',
      'nepali rashifal',
      'horoscope nepal',
      'dainik rashifal',
      'rashifal in nepali',
      '१२ राशिको भाग्यफल',
    ],
    openGraph: {
      title: `आजको राशिफल (${bsDate.shortNepaliDate}) - Daily Horoscope | SabaiChha.com`,
      description:
        'सम्पूर्ण १२ राशिको आजको दैनिक फलादेश, शुभ अंक, शुभ रंग, शुभ दिशा र नामाक्षर।',
      url: 'https://sabaichha.com/rashifal',
      siteName: 'SabaiChha.com',
      locale: 'ne_NP',
      type: 'website',
    },
    alternates: {
      canonical: 'https://sabaichha.com/rashifal',
    },
  }
}

export default async function RashifalPage() {
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

  const rashifalList = getDailyRashifal(new Date())

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
            name: 'राशिफल (Daily Rashifal)',
            item: 'https://sabaichha.com/rashifal',
          },
        ],
      },
      {
        '@type': 'ItemList',
        name: 'Daily Nepali Rashifal (12 Zodiacs)',
        itemListElement: rashifalList.map((r, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: `${r.nameNe} (${r.nameEn}) - आजको राशिफल`,
          description: r.predictionNe,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'राशिफल भनेको के हो?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'दैनिक राशिफलमा सूर्य, चन्द्रमा र अन्य नवग्रहहरूको गोचरको आधारमा दिनभरिको सम्भावित प्रभावको फलादेश गरिन्छ।',
            },
          },
          {
            '@type': 'Question',
            name: 'आफ्नो राशि कसरी पत्ता लगाउने?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'आफ्नो बोलाउने वा औपचारिक नामको पहिलो अक्षर (नामाक्षर) बाट राशि पत्ता लगाउन सकिन्छ।',
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
          <RashifalClient rashifalList={rashifalList} relatedArticles={relatedArticles} />
        </div>
      </main>

      <Footer />
    </>
  )
}
