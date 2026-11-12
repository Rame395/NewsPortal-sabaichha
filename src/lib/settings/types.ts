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
  coEditorName?: string
  publisherName: string
}

export interface SocialLinksSettings {
  facebook: string
  twitter: string
  youtube: string
  instagram: string
  tiktok: string
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
