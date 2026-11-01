// Bilingual Article Translations for SabaiChha.com

export const ARTICLE_TRANSLATIONS: Record<
  string,
  { title: string; subtitle?: string; excerpt?: string }
> = {
  'cabinet-economic-reform-plan': {
    title: 'Cabinet Endorses New National Economic Reform Action Plan',
    subtitle:
      'Strategic priorities placed on domestic employment generation, industry revitalization, and digital economic governance.',
    excerpt:
      '• Comprehensive stimulus package for domestic manufacturing and SMEs.\n• Integrated one-stop digital window for national infrastructure investments.\n• Targeted inflation control mechanisms and fiscal discipline standards.',
  },
  'hydropower-export-record-forex': {
    title:
      'Historic Revenue from Hydropower Export Bolsters Nepal’s Foreign Exchange Reserves',
    subtitle:
      'Cross-border electricity trading with regional partners achieves record-breaking growth.',
    excerpt:
      '• Nepal Electricity Authority records unprecedented surplus revenue from monsoon exports.\n• Long-term bilateral energy agreements ensure sustainable foreign currency inflows.\n• Domestic grid modernization underway to support transmission capacity.',
  },
  'nepal-cricket-historic-series-win': {
    title:
      'Nepal National Cricket Team Secures Historic International Series Triumph',
    subtitle:
      'Sensational team performance in final match seals decisive trophy victory.',
    excerpt:
      '• Spirited batting and disciplined bowling attack overwhelm opposing lineup.\n• Thousands of cheering supporters celebrate historic milestone at stadium.\n• Cricket Association of Nepal (CAN) announces special performance bonuses.',
  },
}

export function getLocalizedTitle(
  art: { slug: string; title: string },
  lang: 'ne' | 'en'
): string {
  if (lang === 'en' && ARTICLE_TRANSLATIONS[art.slug]?.title) {
    return ARTICLE_TRANSLATIONS[art.slug].title
  }
  return art.title
}

export function getLocalizedSubtitle(
  art: { slug: string; subtitle?: string | null },
  lang: 'ne' | 'en'
): string | null | undefined {
  if (lang === 'en' && ARTICLE_TRANSLATIONS[art.slug]?.subtitle) {
    return ARTICLE_TRANSLATIONS[art.slug].subtitle
  }
  return art.subtitle
}

export function getLocalizedExcerpt(
  art: { slug: string; excerpt?: string | null },
  lang: 'ne' | 'en'
): string | null | undefined {
  if (lang === 'en' && ARTICLE_TRANSLATIONS[art.slug]?.excerpt) {
    return ARTICLE_TRANSLATIONS[art.slug].excerpt
  }
  return art.excerpt
}
