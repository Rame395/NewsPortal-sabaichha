'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Film, Clock, ArrowRight, X } from 'lucide-react'
import { useLanguage } from '@/context/language-context'
import { getLocalizedTitle } from '@/lib/data/translations'
import { toNepaliNumerals } from '@/lib/utils/numerals'
import { CategoryStorySnippet } from '@/components/home/category-hero-section'

interface MultimediaShowcaseProps {
  articles: CategoryStorySnippet[]
  className?: string
}

function getYouTubeId(url?: string | null): string | null {
  if (!url) return null
  try {
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0]
    }
    if (url.includes('youtube.com/watch')) {
      return new URLSearchParams(new URL(url).search).get('v')
    }
    if (url.includes('youtube.com/embed/')) {
      return url.split('youtube.com/embed/')[1].split('?')[0]
    }
  } catch {}
  return null
}

export function MultimediaShowcase({ articles = [], className = '' }: MultimediaShowcaseProps) {
  const { language } = useLanguage()

  // Video lightbox modal state
  const [activeVideoModal, setActiveVideoModal] = React.useState<{
    title: string
    youtubeId?: string | null
    directVideoUrl?: string | null
    slug: string
  } | null>(null)

  if (!articles || articles.length === 0) return null

  const byNewest = (a: CategoryStorySnippet, b: CategoryStorySnippet) => {
    const tA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const tB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return tB - tA
  }

  // Strictly filter stories with genuine videoUrl or in 'video' category (newest first)
  const videoCandidates = articles
    .filter((a) => Boolean(a.videoUrl) || a.category?.slug === 'video')
    .sort((a, b) => {
      // Stories with an actual playable videoUrl come before text-only 'video' category items
      if (Boolean(a.videoUrl) !== Boolean(b.videoUrl)) {
        return a.videoUrl ? -1 : 1
      }
      return byNewest(a, b)
    })

  const videoStories = videoCandidates.slice(0, 4)

  // If no videos exist, do not render the section
  if (videoStories.length === 0) {
    return null
  }

  const formatTimeAgo = (dateStr: string | null | Date) => {
    if (!dateStr) return ''
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    if (diff < 1) return language === 'ne' ? 'भर्खरै' : 'Just now'
    if (diff < 60) {
      const num = language === 'ne' ? toNepaliNumerals(diff) : diff
      return `${num} ${language === 'ne' ? 'मिनेट अगाडि' : 'min ago'}`
    }
    const hours = Math.floor(diff / 60)
    if (hours < 24) {
      const num = language === 'ne' ? toNepaliNumerals(hours) : hours
      return `${num} ${language === 'ne' ? 'घण्टा अगाडि' : 'hr ago'}`
    }
    const days = Math.floor(hours / 24)
    const num = language === 'ne' ? toNepaliNumerals(days) : days
    return `${num} ${language === 'ne' ? 'दिन अगाडि' : 'd ago'}`
  }

  const handleVideoClick = (e: React.MouseEvent, story: CategoryStorySnippet) => {
    const yId = getYouTubeId(story.videoUrl)
    const cleanUrl = story.videoUrl?.toLowerCase().split('?')[0] || ''
    const isDirectVid = cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm')

    if (yId || isDirectVid) {
      e.preventDefault()
      setActiveVideoModal({
        title: story.title,
        youtubeId: yId,
        directVideoUrl: isDirectVid ? story.videoUrl : null,
        slug: story.slug,
      })
    }
  }

  const leadVideo = videoStories[0]
  const playlistVideos = videoStories.slice(1, 4)

  return (
    <section className={`space-y-4 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b-2 border-red-600">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-red-600 text-white shadow-2xs">
            <Film className="w-4 h-4" />
          </span>
          <h3 className="text-base sm:text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight">
            {language === 'ne' ? 'भिडियो तथा अन्तर्वार्ता' : 'Video & Interviews'}
          </h3>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          {language === 'ne' ? 'दृश्यकथा तथा विशेष भिडियो' : 'Visual Stories & Video Reports'}
        </span>
      </div>

      {/* Main Video Theater Card */}
      <div className="bg-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-sm border border-slate-800 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-500">
            <Play className="w-4 h-4 fill-red-500" />
            <span>{language === 'ne' ? 'भिडियो समाचार' : 'Video Reports'}</span>
          </span>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full font-bold">
            {language === 'ne' ? 'दृश्यकथा' : 'Video Specials'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Featured Lead Video */}
          {leadVideo && (
            <div className={playlistVideos.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'}>
              <Link
                href={`/news/${leadVideo.slug}`}
                onClick={(e) => handleVideoClick(e, leadVideo)}
                className="relative aspect-16/10 rounded-2xl overflow-hidden group block shadow-md cursor-pointer border border-slate-800"
              >
                {leadVideo.featuredImage ? (
                  <Image
                    src={leadVideo.featuredImage}
                    alt={leadVideo.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <Film className="w-10 h-10 opacity-30" />
                  </div>
                )}

                {/* Centered Glowing Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition duration-300 backdrop-blur-xs ring-4 ring-white/20">
                    <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white translate-x-0.5" />
                  </div>
                </div>

                {/* Bottom Caption Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 sm:p-5 pt-8">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold w-fit mb-1.5 shadow-xs">
                    <Play className="w-2.5 h-2.5 fill-white" />
                    <span>
                      {leadVideo.videoUrl
                        ? language === 'ne'
                          ? 'भिडियो हेर्नुहोस् (लाइभ)'
                          : 'Watch Video'
                        : language === 'ne'
                        ? 'भिडियो हेर्नुहोस्'
                        : 'Watch Video'}
                    </span>
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-white group-hover:text-red-400 transition leading-snug line-clamp-2">
                    {getLocalizedTitle(leadVideo, language)}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(leadVideo.publishedAt)}</span>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Playlist / More Videos (Right Column) */}
          {playlistVideos.length > 0 && (
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-1">
                <Film className="w-3.5 h-3.5 text-red-500" />
                <span>{language === 'ne' ? 'थप भिडियोहरू' : 'More Videos'}</span>
              </div>

              <div className="space-y-2.5">
                {playlistVideos.map((vStory) => (
                  <Link
                    key={vStory.id}
                    href={`/news/${vStory.slug}`}
                    onClick={(e) => handleVideoClick(e, vStory)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition group cursor-pointer"
                  >
                    <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-700">
                      {vStory.featuredImage ? (
                        <Image
                          src={vStory.featuredImage}
                          alt={vStory.title}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                          <Film className="w-5 h-5 opacity-40" />
                        </div>
                      )}
                      <span className="absolute inset-0 bg-black/35 flex items-center justify-center group-hover:bg-black/20 transition">
                        <span className="w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow">
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        </span>
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-red-400 transition line-clamp-2 leading-snug">
                        {getLocalizedTitle(vStory, language)}
                      </h5>
                      <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatTimeAgo(vStory.publishedAt)}</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Video Lightbox Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-red-600 text-white">
                  <Play className="w-3.5 h-3.5 fill-white" />
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'ne' ? 'भिडियो समाचार' : 'Video Report'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black">
              {activeVideoModal.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideoModal.youtubeId}?autoplay=1&rel=0`}
                  title={activeVideoModal.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : activeVideoModal.directVideoUrl ? (
                <video
                  src={activeVideoModal.directVideoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : null}
            </div>

            {/* Modal Footer with Story Link */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90">
              <h4 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
                {activeVideoModal.title}
              </h4>
              <Link
                href={`/news/${activeVideoModal.slug}`}
                onClick={() => setActiveVideoModal(null)}
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs"
              >
                <span>{language === 'ne' ? 'पूर्ण समाचार पढ्नुहोस्' : 'Read Full Story'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
