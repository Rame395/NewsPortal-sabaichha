import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { NepaliUnicodeClient } from '@/components/tools/nepali-unicode-client'
import { prisma, ArticleStatus } from '@/lib/prisma'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'नेपाली युनिकोड कन्भर्टर (Nepali Unicode Typing Online) | SabaiChha',
  description:
    'अंग्रेजी किबोर्डबाट सजिलै शुद्ध नेपाली युनिकोड टाइप गर्नुहोस्। १-क्लिक कपी, शब्द गणना, टेक्स्ट फाइल डाउनलोड र पूर्ण रोमन क्यारेक्टर म्यापिङ गाइड।',
  keywords: [
    'nepali unicode',
    'nepali typing online',
    'romanized nepali converter',
    'type nepali',
    'unicode nepali converter',
    'nepali font converter',
    'preeti to unicode',
  ],
  openGraph: {
    title: 'नेपाली युनिकोड कन्भर्टर (Romanized Typing) | SabaiChha.com',
    description:
      'रोमन अंग्रेजीबाट नेपाली युनिकोडमा प्रत्यक्ष टाइपिङ, १-क्लिक कपी र शब्द काउन्टर।',
    url: 'https://sabaichha.com/tools/nepali-unicode',
    siteName: 'SabaiChha.com',
    locale: 'ne_NP',
    type: 'website',
  },
  alternates: {
    canonical: 'https://sabaichha.com/tools/nepali-unicode',
  },
}

export default async function NepaliUnicodePage() {
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
            name: 'नेपाली युनिकोड (Nepali Unicode)',
            item: 'https://sabaichha.com/tools/nepali-unicode',
          },
        ],
      },
      {
        '@type': 'WebApplication',
        name: 'Nepali Unicode Typing Converter',
        url: 'https://sabaichha.com/tools/nepali-unicode',
        applicationCategory: 'TextEditor',
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
            name: 'नेपाली युनिकोड के हो?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'नेपाली युनिकोड अन्तर्राष्ट्रिय स्तरमा मान्य भएको कम्प्युटर क्यारेक्टर कोडिङ प्रणाली हो जसलाई कुनै पनि मोबाइल, फेसबुक वा वेबसाइटमा फन्ट इन्स्टल नगरिकनै पढ्न र लेख्न सकिन्छ।',
            },
          },
          {
            '@type': 'Question',
            name: 'रोमनबाट नेपाली टाइप कसरी गर्ने?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'अंग्रेजीमा उच्चारण अनुसार टाइप गर्नुहोस् (जस्तै: "namaste" = "नमस्ते") र स्पेस थिच्दा शब्द स्वतः नेपाली युनिकोडमा रूपान्तरण हुन्छ।',
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
          <NepaliUnicodeClient relatedArticles={relatedArticles} />
        </div>
      </main>

      <Footer />
    </>
  )
}
