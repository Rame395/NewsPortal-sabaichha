import prisma from '@/lib/prisma'

export interface SiteInfoSettings {
  portalName: string
  sloganNe: string
  sloganEn: string
  addressNe: string
  addressEn: string
  phone: string
  email: string
  pressCouncilNo: string
  deptOfInfoNo: string
  editorName: string
  publisherName: string
}

export interface SocialLinksSettings {
  facebook: string
  twitter: string
  youtube: string
  instagram: string
  linkedin: string
  telegram: string
  whatsapp: string
}

export interface LiveTickersSettings {
  weatherCity: string
  weatherCityEn: string
  showWeather: boolean
  goldRate: string
  silverRate: string
  showGold: boolean
  nepseIndex: string
  nepseChange: string
  nepsePositive: boolean
  showNepse: boolean
  forexUsd: string
  showForex: boolean
}

export interface FooterSettings {
  aboutNe: string
  aboutEn: string
  copyrightText: string
}

export interface TrendingTopicItem {
  id: string
  labelNe: string
  labelEn: string
  url?: string
  isHot?: boolean
  isActive: boolean
}

export interface TrendingTopicsSettings {
  enabled: boolean
  titleNe: string
  titleEn: string
  items: TrendingTopicItem[]
}

export interface AllSettings {
  siteInfo: SiteInfoSettings
  socialLinks: SocialLinksSettings
  liveTickers: LiveTickersSettings
  trendingTopics: TrendingTopicsSettings
  footer: FooterSettings
}

export const DEFAULT_TRENDING_TOPICS: TrendingTopicsSettings = {
  enabled: true,
  titleNe: 'चर्चामा',
  titleEn: 'Trending',
  items: [
    { id: '1', labelNe: '#लुम्बिनी_महोत्सव', labelEn: '#LumbiniExpo', url: '/search?q=लुम्बिनी', isHot: true, isActive: true },
    { id: '2', labelNe: '#नेपाली_क्रिकेट', labelEn: '#NepalCricket', url: '/search?q=क्रिकेट', isHot: true, isActive: true },
    { id: '3', labelNe: '#आर्थिक_सुधार', labelEn: '#EconomicReform', url: '/search?q=आर्थिक', isHot: false, isActive: true },
    { id: '4', labelNe: '#नेप्से_परिसूचक', labelEn: '#NEPSE', url: '/search?q=नेप्से', isHot: false, isActive: true },
    { id: '5', labelNe: '#जलविद्युत्_निर्यात', labelEn: '#Hydropower', url: '/search?q=जलविद्युत्', isHot: true, isActive: true },
    { id: '6', labelNe: '#मन्त्रिपरिषद्_निर्णय', labelEn: '#CabinetDecision', url: '/search?q=मन्त्रिपरिषद्', isHot: false, isActive: true },
    { id: '7', labelNe: '#पर्यटन_प्रवर्द्धन', labelEn: '#TourismNepal', url: '/search?q=पर्यटन', isHot: false, isActive: true },
  ],
}

export const DEFAULT_SITE_SETTINGS: AllSettings = {
  siteInfo: {
    portalName: 'SabaiChha.com',
    sloganNe: 'सूचना संवाद र मनोरञ्जनको संगम, सबै छ डट कम',
    sloganEn: 'Confluence of Information, Dialogue & Entertainment',
    addressNe: 'काठमाडौँ महानगरपालिका, बागमती प्रदेश, नेपाल',
    addressEn: 'Kathmandu Metropolitan City, Bagmati Province, Nepal',
    phone: '+977 1-4240000 / 9851000000',
    email: 'info@sabaichha.com',
    pressCouncilNo: 'प्रेस काउन्सिल दर्ता नं.: १२३/०८०-८१',
    deptOfInfoNo: 'सूचना विभाग दर्ता नं.: ४५६/०८०-८१',
    editorName: 'सन्तोष श्रेष्ठ (प्रधान सम्पादक)',
    publisherName: 'सबै छ मिडिया नेटवर्क प्रा. लि.',
  },
  socialLinks: {
    facebook: 'https://facebook.com/sabaichha',
    twitter: 'https://x.com/sabaichha',
    youtube: 'https://youtube.com/@sabaichha',
    instagram: 'https://instagram.com/sabaichha',
    linkedin: 'https://linkedin.com/company/sabaichha',
    telegram: 'https://t.me/sabaichha',
    whatsapp: 'https://wa.me/9779851000000',
  },
  liveTickers: {
    weatherCity: 'काठमाडौँ',
    weatherCityEn: 'Kathmandu',
    showWeather: true,
    goldRate: '२,७२,०००',
    silverRate: '३,६५०',
    showGold: true,
    nepseIndex: '२,६९०.१५',
    nepseChange: '-५.४५ (-०.२०%)',
    nepsePositive: false,
    showNepse: true,
    forexUsd: '१५२.०३',
    showForex: true,
  },
  trendingTopics: DEFAULT_TRENDING_TOPICS,
  footer: {
    aboutNe:
      'सूचना, विचार र मनोरञ्जनको अग्रणी डिजिटल पत्रिका। निष्पक्ष, तथ्यपरक र जनसरोकारका समाचारहरू छिटो र भरपर्दो रूपमा सम्प्रेषण गर्न हामी सदैव प्रतिबद्ध छौं।',
    aboutEn:
      'Leading digital news portal dedicated to authentic, independent, and timely journalism in Nepal.',
    copyrightText: '© 2026 SabaiChha.com. सर्वाधिकार सुरक्षित।',
  },
}

export async function getSiteSettings(): Promise<AllSettings> {
  try {
    const records = await prisma.siteSetting.findMany()
    const map = new Map<string, any>()
    for (const r of records) {
      try {
        map.set(r.key, JSON.parse(r.value))
      } catch {
        map.set(r.key, r.value)
      }
    }

    return {
      siteInfo: { ...DEFAULT_SITE_SETTINGS.siteInfo, ...(map.get('site_info') || {}) },
      socialLinks: { ...DEFAULT_SITE_SETTINGS.socialLinks, ...(map.get('social_links') || {}) },
      liveTickers: { ...DEFAULT_SITE_SETTINGS.liveTickers, ...(map.get('live_tickers') || {}) },
      trendingTopics: { ...DEFAULT_SITE_SETTINGS.trendingTopics, ...(map.get('trending_topics') || {}) },
      footer: { ...DEFAULT_SITE_SETTINGS.footer, ...(map.get('footer_info') || {}) },
    }
  } catch (error) {
    console.error('Error fetching site settings from DB:', error)
    return DEFAULT_SITE_SETTINGS
  }
}
