'use client'

import * as React from 'react'
import { Bookmark } from 'lucide-react'

export interface BookmarkArticleData {
  id: string
  title: string
  slug: string
  featuredImage?: string | null
  categoryName?: string
}

export function BookmarkButton({
  article,
  size = 'md',
  className = '',
}: {
  article: BookmarkArticleData
  size?: 'sm' | 'md'
  className?: string
}) {
  const [isSaved, setIsSaved] = React.useState(false)

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('sabaichha_saved_articles')
      if (stored) {
        const list: BookmarkArticleData[] = JSON.parse(stored)
        setIsSaved(list.some((a) => a.id === article.id))
      }
    } catch {}

    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem('sabaichha_saved_articles')
        if (stored) {
          const list: BookmarkArticleData[] = JSON.parse(stored)
          setIsSaved(list.some((a) => a.id === article.id))
        } else {
          setIsSaved(false)
        }
      } catch {}
    }

    window.addEventListener('sabaichha_bookmarks_changed', handleUpdate)
    return () => window.removeEventListener('sabaichha_bookmarks_changed', handleUpdate)
  }, [article.id])

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const stored = localStorage.getItem('sabaichha_saved_articles')
      let list: BookmarkArticleData[] = stored ? JSON.parse(stored) : []

      if (isSaved) {
        list = list.filter((a) => a.id !== article.id)
        setIsSaved(false)
      } else {
        list.unshift(article)
        setIsSaved(true)
      }

      localStorage.setItem('sabaichha_saved_articles', JSON.stringify(list))
      window.dispatchEvent(new Event('sabaichha_bookmarks_changed'))
    } catch (err) {
      console.error('Error saving bookmark:', err)
    }
  }

  const isSmall = size === 'sm'

  return (
    <button
      type="button"
      onClick={toggleBookmark}
      className={`rounded-full transition flex items-center justify-center cursor-pointer ${
        isSmall ? 'p-1.5' : 'p-2'
      } ${
        isSaved
          ? 'bg-red-600 text-white shadow-md shadow-red-600/30 hover:bg-red-700'
          : 'bg-white/90 dark:bg-slate-800/90 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-red-500/40'
      } ${className}`}
      title={isSaved ? 'सुरक्षित सूचीबाट हटाउनुहोस् (Remove from saved)' : 'पछि पढ्नका लागि सुरक्षित गर्नुहोस् (Save for later)'}
      aria-label="Save for later"
    >
      <Bookmark
        className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${
          isSaved ? 'fill-white stroke-white' : ''
        }`}
      />
    </button>
  )
}
