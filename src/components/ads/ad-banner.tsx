'use client'

import * as React from 'react'
import Image from 'next/image'
import { ExternalLink, X } from 'lucide-react'

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
          // Pick the first active ad or randomize if multiple
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

  // 1. Sticky Footer Floating Ad Banner
  if (placement === 'STICKY_FOOTER') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl py-2 px-4 transition-transform animate-in slide-in-from-bottom duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[9px] font-extrabold uppercase bg-red-600 text-white px-1.5 py-0.5 rounded shrink-0">
              विज्ञापन
            </span>
            {ad.imageUrl && (
              <div className="relative w-12 h-10 rounded-lg overflow-hidden shrink-0 hidden sm:block">
                <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover" />
              </div>
            )}
            <div className="min-w-0">
              <a
                href={ad.targetUrl || '#'}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={handleAdClick}
                className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-red-600 transition truncate block"
              >
                {ad.title}
              </a>
              {ad.sponsorName && (
                <p className="text-[10px] text-slate-500 truncate">
                  प्रायोजक: {ad.sponsorName}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {ad.targetUrl && (
              <a
                href={ad.targetUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={handleAdClick}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
              >
                <span>हेर्नुहोस्</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="बन्द गर्नुहोस् (Close)"
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
        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">
          विज्ञापन (Advertisement)
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

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      {/* Disclaimer tag */}
      <div className="w-full flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 px-1">
        <span>विज्ञापन / ADVERTISEMENT</span>
        {ad.sponsorName && <span>प्रायोजक: {ad.sponsorName}</span>}
      </div>

      <a
        href={ad.targetUrl || '#'}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={handleAdClick}
        className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group shadow-2xs hover:shadow-md transition block ${
          isLeaderboard
            ? 'aspect-8/1 sm:aspect-10/1 max-h-24'
            : isBillboard
            ? 'aspect-4/1 sm:aspect-6/1 max-h-48'
            : isSidebar
            ? 'aspect-6/5 max-h-64'
            : 'aspect-6/1 max-h-32'
        }`}
      >
        {ad.imageUrl ? (
          <Image
            src={ad.imageUrl}
            alt={ad.title}
            fill
            className="object-cover group-hover:scale-101 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 text-center">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {ad.title}
            </span>
          </div>
        )}

        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-end justify-end p-2 opacity-0 group-hover:opacity-100">
          <span className="px-2 py-1 rounded bg-black/70 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs">
            <span>थप जान्नुहोस्</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </a>
    </div>
  )
}
