import prisma from '@/lib/prisma'
import {
  SiteInfoSettings,
  SocialLinksSettings,
  LiveTickersSettings,
  FooterSettings,
  TrendingTopicItem,
  TrendingTopicsSettings,
  AllSettings,
} from './types'

export type {
  SiteInfoSettings,
  SocialLinksSettings,
  LiveTickersSettings,
  FooterSettings,
  TrendingTopicItem,
  TrendingTopicsSettings,
  AllSettings,
}

export { DEFAULT_TRENDING_TOPICS, DEFAULT_SITE_SETTINGS } from './defaults'
import { DEFAULT_SITE_SETTINGS } from './defaults'

let cachedSettings: { data: AllSettings; timestamp: number } | null = null
const SETTINGS_CACHE_TTL_MS = 60 * 1000 // 60 seconds

export function invalidateSiteSettingsCache(): void {
  cachedSettings = null
}

export async function getSiteSettings(): Promise<AllSettings> {
  const now = Date.now()
  if (cachedSettings && now - cachedSettings.timestamp < SETTINGS_CACHE_TTL_MS) {
    return cachedSettings.data
  }

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

    const settings: AllSettings = {
      siteInfo: { ...DEFAULT_SITE_SETTINGS.siteInfo, ...(map.get('site_info') || {}) },
      socialLinks: { ...DEFAULT_SITE_SETTINGS.socialLinks, ...(map.get('social_links') || {}) },
      liveTickers: { ...DEFAULT_SITE_SETTINGS.liveTickers, ...(map.get('live_tickers') || {}) },
      trendingTopics: { ...DEFAULT_SITE_SETTINGS.trendingTopics, ...(map.get('trending_topics') || {}) },
      footer: { ...DEFAULT_SITE_SETTINGS.footer, ...(map.get('footer_info') || {}) },
    }

    cachedSettings = { data: settings, timestamp: now }
    return settings
  } catch (error) {
    console.error('Error fetching site settings from DB:', error)
    return cachedSettings?.data || DEFAULT_SITE_SETTINGS
  }
}
