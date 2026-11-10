'use client'

import * as React from 'react'
import Image from 'next/image'
import { ExternalLink, X } from 'lucide-react'
import { useLanguage } from '@/context/language-context'

export type AdPlacementType =
  | 'HEADER_LEADERBOARD'
  | 'HOMEPAGE_BILLBOARD'
  | 'SIDEBAR_RECTANGLE'
  | 'ARTICLE_INLINE'
  | 'STICKY_FOOTER'

interface AdData {
  id: string
  title: string
  placement: AdPlacementType
  type: 'IMAGE_BANNER' | 'GOOGLE_ADSENSE' | 'CUSTOM_HTML'
  imageUrl?: string | null
  targetUrl?: string | null
  scriptCode?: string | null
  sponsorName?: string | null
}

interface AdBannerProps {
  placement: AdPlacementType
  className?: string
  initialAd?: AdData | null
}

export function AdBanner({ placement, className = '', initialAd }: AdBannerProps) {
  const { language } = useLanguage()
  const isNe = language === 'ne'

  const [ad, setAd] = React.useState<AdData | null>(initialAd || null)
  const [isDismissed, setIsDismissed] = React.useState(false)
  const [loading, setLoading] = React.useState(!initialAd)

  React.useEffect(() => {
    if (initialAd) return
    let isMounted = true

    fetch(`/api/public/ads?placement=${placement}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.ads && data.ads.length > 0) {
          // Pick the first active ad
          setAd(data.ads[0])
        }
      })
      .catch((err) => console.error('Failed to load ad banner:', err))
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [placement, initialAd])

  if (isDismissed || loading || !ad) {
    return null
  }

  const handleAdClick = async () => {
    try {
      fetch(`/api/public/ads/${ad.id}/click`, { method: 'POST' }).catch(() => {})
    } catch {}
  }

  // Defense-in-depth: only allow http(s) or relative links in href
  const safeTargetUrl =
    ad.targetUrl && (/^https?:\/\//i.test(ad.targetUrl.trim()) || (ad.targetUrl.trim().startsWith('/') && !ad.targetUrl.trim().startsWith('//')))
      ? ad.targetUrl.trim()
      : null

  const isVideoMedia = (url?: string | null) => {
    if (!url) return false
    const clean = url.toLowerCase().split('?')[0]
    return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.includes('/video/')
  }

  const isGifMedia = (url?: string | null) => {
    if (!url) return false
    const clean = url.toLowerCase().split('?')[0]
    return clean.endsWith('.gif')
  }

  // 1. Sticky Footer Floating Ad Banner
  if (placement === 'STICKY_FOOTER') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl py-1.5 sm:py-2 px-2.5 sm:px-4 transition-transform animate-in slide-in-from-bottom duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-[9px] font-extrabold uppercase bg-red-600 text-white px-1.5 py-0.5 rounded-sm shrink-0">
              {isNe ? 'विज्ञापन' : 'Ad'}
            </span>
            {ad.imageUrl && (
              <div className="relative w-12 h-10 rounded-lg overflow-hidden shrink-0 hidden sm:block bg-slate-100 dark:bg-slate-800">
                {isVideoMedia(ad.imageUrl) ? (
                  <video
                    src={ad.imageUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={ad.imageUrl}
                    alt={ad.title}
                    fill
                    unoptimized={isGifMedia(ad.imageUrl)}
                    className="object-contain"
                  />
                )}
              </div>
            )}
            <div className="min-w-0">
              <a
                href={safeTargetUrl || '#'}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={handleAdClick}
                className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-red-600 transition truncate block"
              >
                {ad.title}
              </a>
              {ad.sponsorName && (
                <p className="text-[10px] text-slate-500 truncate">
                  {isNe ? `प्रायोजक: ${ad.sponsorName}` : `Sponsor: ${ad.sponsorName}`}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {safeTargetUrl && (
              <a
                href={safeTargetUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={handleAdClick}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold transition flex items-center gap-1 shadow-xs shrink-0"
              >
                <span>{isNe ? 'हेर्नुहोस्' : 'Visit'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer"
              title={isNe ? 'बन्द गर्नुहोस्' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 2. Custom Script / Google AdSense code
  if (ad.type === 'CUSTOM_HTML' || ad.type === 'GOOGLE_ADSENSE') {
    return (
      <div className={`w-full text-center my-4 ${className}`}>
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
          {isNe ? 'विज्ञापन' : 'ADVERTISEMENT'}
        </div>
        <div
          className="overflow-hidden flex justify-center"
          dangerouslySetInnerHTML={{ __html: ad.scriptCode || '' }}
        />
      </div>
    )
  }

  // 3. Image Banners (Header Leaderboard, Homepage Billboard, Sidebar, Article Inline)
  const isLeaderboard = placement === 'HEADER_LEADERBOARD'
  const isBillboard = placement === 'HOMEPAGE_BILLBOARD'
  const isSidebar = placement === 'SIDEBAR_RECTANGLE'

  // Responsive container height classes tailored to standard ad dimensions
  const containerClasses = isLeaderboard
    ? 'w-full aspect-[728/90] h-auto max-h-[60px] sm:max-h-[90px]'
    : isBillboard
    ? 'h-36 sm:h-52 md:h-64 max-w-5xl'
    : isSidebar
    ? 'h-64 sm:h-72 max-w-sm'
    : 'h-24 sm:h-28 max-w-3xl' // ARTICLE_INLINE

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      {/* Disclaimer tag */}
      <div className="w-full max-w-5xl flex items-center justify-between text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5 px-0.5">
        <span>{isNe ? 'विज्ञापन' : 'ADVERTISEMENT'}</span>
        {ad.sponsorName && (
          <span>{isNe ? `प्रायोजक: ${ad.sponsorName}` : `SPONSOR: ${ad.sponsorName}`}</span>
        )}
      </div>

      <a
        href={safeTargetUrl || '#'}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={handleAdClick}
        className={`relative w-full rounded-lg sm:rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 group shadow-2xs hover:shadow-md transition block ${containerClasses}`}
      >
        {ad.imageUrl ? (
          isVideoMedia(ad.imageUrl) ? (
            <video
              src={ad.imageUrl}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-contain group-hover:scale-[1.01] transition duration-300"
            />
          ) : (
            <Image
              src={ad.imageUrl}
              alt={ad.title}
              fill
              unoptimized={isGifMedia(ad.imageUrl)}
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-contain group-hover:scale-[1.01] transition duration-300"
              priority={isLeaderboard}
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 text-center">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {ad.title}
            </span>
          </div>
        )}

        {/* Subtle indicator tag on hover */}
        {safeTargetUrl && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition duration-200">
            <span className="px-2 py-1 rounded-md bg-black/75 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm backdrop-blur-xs">
              <span>{isNe ? 'वेबसाइट खोल्नुहोस्' : 'Visit Link'}</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        )}
      </a>
    </div>
  )
}
