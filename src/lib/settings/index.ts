import prisma from '@/lib/prisma'
import {
  SiteInfoSettings,
  SocialLinksSettings,
  LiveTickersSettings,
  FooterSettings,
  TrendingTopicItem,
  TrendingTopicsSettings,
  TeamMemberItem,
  TeamSettings,
  TeamDepartment,
  AllSettings,
} from './types'

export type {
  SiteInfoSettings,
  SocialLinksSettings,
  LiveTickersSettings,
  FooterSettings,
  TrendingTopicItem,
  TrendingTopicsSettings,
  TeamMemberItem,
  TeamSettings,
  TeamDepartment,
  AllSettings,
}

export { DEFAULT_TRENDING_TOPICS, DEFAULT_TEAM_SETTINGS, DEFAULT_SITE_SETTINGS } from './defaults'
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

    const rawSite = map.get('site_info') || {}
    const rawSocial = map.get('social_links') || {}
    const settings: AllSettings = {
      siteInfo: {
        ...DEFAULT_SITE_SETTINGS.siteInfo,
        ...rawSite,
        phone:
          rawSite.phone && rawSite.phone !== '+977 1-4240000 / 9851000000'
            ? rawSite.phone
            : DEFAULT_SITE_SETTINGS.siteInfo.phone,
        deptOfInfoNo: rawSite.deptOfInfoNo || DEFAULT_SITE_SETTINGS.siteInfo.deptOfInfoNo,
        editorName: rawSite.editorName || DEFAULT_SITE_SETTINGS.siteInfo.editorName,
        coEditorName: rawSite.coEditorName || DEFAULT_SITE_SETTINGS.siteInfo.coEditorName,
      },
      socialLinks: {
        ...DEFAULT_SITE_SETTINGS.socialLinks,
        ...rawSocial,
        tiktok: rawSocial.tiktok || DEFAULT_SITE_SETTINGS.socialLinks.tiktok,
      },
      liveTickers: { ...DEFAULT_SITE_SETTINGS.liveTickers, ...(map.get('live_tickers') || {}) },
      trendingTopics: { ...DEFAULT_SITE_SETTINGS.trendingTopics, ...(map.get('trending_topics') || {}) },
      footer: { ...DEFAULT_SITE_SETTINGS.footer, ...(map.get('footer_info') || {}) },
      team: { ...DEFAULT_SITE_SETTINGS.team, ...(map.get('team_members') || {}) },
    }

    cachedSettings = { data: settings, timestamp: now }
    return settings
  } catch (error) {
    console.error('Error fetching site settings from DB:', error)
    return cachedSettings?.data || DEFAULT_SITE_SETTINGS
  }
}
