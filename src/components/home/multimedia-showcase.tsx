'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Camera, Play, Film, Sparkles, Clock, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/context/language-context'
import { toNepaliNumerals } from '@/lib/market/market-service'
import { CategoryStorySnippet } from '@/components/home/category-hero-section'

interface MultimediaShowcaseProps {
  articles: CategoryStorySnippet[]
  className?: string
}

export function MultimediaShowcase({ articles = [], className = '' }: MultimediaShowcaseProps) {
  const { language } = useLanguage()

  if (!articles || articles.length === 0) return null

  // Split into photo candidates and video candidates (or take top high-res stories)
  const photoStories = articles.slice(0, 2)
  const videoStories = articles.slice(2, 5).length > 0 ? articles.slice(2, 5) : articles.slice(0, 3)

  const formatTimeAgo = (dateStr: string | null | Date) => {
    if (!dateStr) return ''
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    if (diff < 1) return language === 'ne' ? 'भर्खरै' : 'Just now'
    if (diff < 60) {
      const num = language === 'ne' ? toNepaliNumerals(diff) : diff
      return `${num} ${language === 'ne' ? 'मिनेट अगाडि' : 'm ago'}`
    }
    const hours = Math.floor(diff / 60)
    if (hours < 24) {
      const num = language === 'ne' ? toNepaliNumerals(hours) : hours
      return `${num} ${language === 'ne' ? 'घण्टा अगाडि' : 'h ago'}`
    }
    const days = Math.floor(hours / 24)
    const num = language === 'ne' ? toNepaliNumerals(days) : days
    return `${num} ${language === 'ne' ? 'दिन अगाडि' : 'd ago'}`
  }

  return (
    <section className={`space-y-5 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b-2 border-red-600">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-red-600 text-white shadow-2xs">
            <Film className="w-4 h-4" />
          </span>
          <h3 className="text-base sm:text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight">
            {language === 'ne' ? 'मल्टिमिडिया : फोटो फिचर र भिडियो' : 'Multimedia : Photos & Videos'}
          </h3>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          {language === 'ne' ? 'विशेष दृश्य तथा अन्तर्वार्ता' : 'Visual Stories & Video Reports'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* ========================================================= */}
        {/* LEFT 6 COLS: PHOTO FEATURE (फोटो फिचर) */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 bg-slate-900 rounded-3xl p-5 sm:p-6 text-white space-y-4 shadow-sm border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
              <Camera className="w-4 h-4" />
              <span>{language === 'ne' ? 'फोटो फिचर' : 'Photo Feature'}</span>
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full font-bold">
              {language === 'ne' ? 'तस्बिरमा समाचार' : 'Visual Journalism'}
            </span>
          </div>

          {photoStories[0] && (
            <Link
              href={`/news/${photoStories[0].slug}`}
              className="relative aspect-16/10 rounded-2xl overflow-hidden group block shadow-md"
            >
              {photoStories[0].featuredImage ? (
                <Image
                  src={photoStories[0].featuredImage}
                  alt={photoStories[0].title}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <Camera className="w-10 h-10 opacity-30" />
                </div>
              )}
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 sm:p-5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold w-fit mb-2 shadow-xs">
                  <Camera className="w-3 h-3" />
                  <span>{language === 'ne' ? 'फोटो कथा' : 'Photo Story'}</span>
                </span>
                <h4 className="text-base sm:text-lg font-black text-white group-hover:text-red-400 transition leading-snug line-clamp-2">
                  {photoStories[0].title}
                </h4>
                <div className="flex items-center gap-3 text-[10px] text-slate-300 mt-2">
                  <span>{formatTimeAgo(photoStories[0].publishedAt)}</span>
                  {photoStories[0].author?.fullName && (
                    <>
                      <span>•</span>
                      <span>{photoStories[0].author.fullName}</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          )}

          {photoStories[1] && (
            <Link
              href={`/news/${photoStories[1].slug}`}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition group"
            >
              {photoStories[1].featuredImage && (
                <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={photoStories[1].featuredImage}
                    alt={photoStories[1].title}
                    fill
                    className="object-cover group-hover:scale-105 transition"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h5 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition line-clamp-2 leading-snug">
                  {photoStories[1].title}
                </h5>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {formatTimeAgo(photoStories[1].publishedAt)}
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT 6 COLS: VIDEO NEWS & INTERVIEWS (भिडियो समाचार) */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 bg-slate-900 rounded-3xl p-5 sm:p-6 text-white space-y-4 shadow-sm border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-500">
              <Play className="w-4 h-4 fill-red-500" />
              <span>{language === 'ne' ? 'भिडियो तथा अन्तर्वार्ता' : 'Video & Interviews'}</span>
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full font-bold">
              {language === 'ne' ? 'दृश्यकथा' : 'Video Reports'}
            </span>
          </div>

          {videoStories[0] && (
            <Link
              href={`/news/${videoStories[0].slug}`}
              className="relative aspect-16/10 rounded-2xl overflow-hidden group block shadow-md"
            >
              {videoStories[0].featuredImage ? (
                <Image
                  src={videoStories[0].featuredImage}
                  alt={videoStories[0].title}
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
                <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition duration-300 backdrop-blur-xs">
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white translate-x-0.5" />
                </div>
              </div>
              {/* Bottom Caption Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-5 pt-8">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold w-fit mb-1.5">
                  <Play className="w-2.5 h-2.5 fill-white" />
                  <span>{language === 'ne' ? 'भिडियो हेर्नुहोस्' : 'Watch Video'}</span>
                </span>
                <h4 className="text-base sm:text-lg font-black text-white group-hover:text-red-400 transition leading-snug line-clamp-2">
                  {videoStories[0].title}
                </h4>
              </div>
            </Link>
          )}

          {/* Sub Video Stories List */}
          <div className="space-y-2">
            {videoStories.slice(1, 3).map((vStory) => (
              <Link
                key={vStory.id}
                href={`/news/${vStory.slug}`}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition group"
              >
                <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0">
                  {vStory.featuredImage ? (
                    <Image
                      src={vStory.featuredImage}
                      alt={vStory.title}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                      <Film className="w-5 h-5 opacity-40" />
                    </div>
                  )}
                  <span className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-4 h-4 fill-white text-white" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-slate-200 group-hover:text-red-400 transition line-clamp-2 leading-snug">
                    {vStory.title}
                  </h5>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {formatTimeAgo(vStory.publishedAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
