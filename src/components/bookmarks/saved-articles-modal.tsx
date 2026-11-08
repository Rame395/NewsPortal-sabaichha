'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bookmark, X, Trash2, ExternalLink, BookOpen } from 'lucide-react'
import { BookmarkArticleData } from './bookmark-button'
import { useLanguage } from '@/context/language-context'

interface SavedArticlesModalProps {
  variant?: 'pill' | 'icon'
}

export function SavedArticlesModal({ variant = 'pill' }: SavedArticlesModalProps) {
  const { language } = useLanguage()
  const [isOpen, setIsOpen] = React.useState(false)
  const [articles, setArticles] = React.useState<BookmarkArticleData[]>([])

  const loadBookmarks = () => {
    try {
      const stored = localStorage.getItem('sabaichha_saved_articles')
      if (stored) {
        setArticles(JSON.parse(stored))
      } else {
        setArticles([])
      }
    } catch {
      setArticles([])
    }
  }

  React.useEffect(() => {
    loadBookmarks()
    const handleUpdate = () => loadBookmarks()
    window.addEventListener('sabaichha_bookmarks_changed', handleUpdate)
    return () => window.removeEventListener('sabaichha_bookmarks_changed', handleUpdate)
  }, [])

  const removeArticle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = articles.filter((a) => a.id !== id)
    setArticles(updated)
    localStorage.setItem('sabaichha_saved_articles', JSON.stringify(updated))
    window.dispatchEvent(new Event('sabaichha_bookmarks_changed'))
  }

  const clearAll = () => {
    if (confirm(language === 'ne' ? 'सबै सुरक्षित समाचारहरू हटाउन चाहनुहुन्छ?' : 'Clear all saved articles?')) {
      setArticles([])
      localStorage.removeItem('sabaichha_saved_articles')
      window.dispatchEvent(new Event('sabaichha_bookmarks_changed'))
    }
  }

  return (
    <>
      {/* Header Trigger Button */}
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="shrink-0 relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-200 hover:text-red-600 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition shadow-2xs cursor-pointer group"
          title={language === 'ne' ? 'सुरक्षित गरिएका समाचारहरू' : 'Saved Articles'}
          aria-label="Saved Articles"
        >
          <Bookmark className="w-4 h-4 text-slate-700 dark:text-slate-200 group-hover:text-red-600 transition" />
          {articles.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white flex items-center justify-center shadow-xs">
              {articles.length}
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="shrink-0 relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer shadow-2xs"
          title="Saved Articles / पछि पढ्नका लागि सुरक्षित"
        >
          <Bookmark className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          <span>
            {language === 'ne' ? 'सुरक्षित' : 'Saved'}
          </span>
          {articles.length > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white">
              {articles.length}
            </span>
          )}
        </button>
      )}

      {/* Slide-over Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex justify-end animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600/10 text-red-600 flex items-center justify-center">
                  <Bookmark className="w-4 h-4 fill-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {language === 'ne' ? 'सुरक्षित गरिएका समाचारहरू' : 'Saved Articles'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {articles.length} {language === 'ne' ? 'समाचार' : 'articles saved'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {articles.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition text-xs"
                    title="सबै हटाउनुहोस् (Clear all)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List of Saved Stories */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {articles.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                  <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {language === 'ne' ? 'कुनै समाचार सुरक्षित गरिएको छैन' : 'No articles saved yet'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      {language === 'ne'
                        ? 'समाचार कार्डको बुकमार्क आइकनमा थिचेर पछि पढ्नका लागि सुरक्षित गर्नुहोस्।'
                        : 'Click the bookmark icon on any article to read it later here.'}
                    </p>
                  </div>
                </div>
              ) : (
                articles.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-red-500/40 transition flex gap-3 group relative"
                  >
                    {item.featuredImage && (
                      <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0">
                        <Image src={item.featuredImage} alt={item.title} fill className="object-cover" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1 pr-6">
                      {item.categoryName && (
                        <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
                          {item.categoryName}
                        </span>
                      )}
                      <Link
                        href={`/news/${item.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition line-clamp-2 leading-snug mt-0.5 block"
                      >
                        {item.title}
                      </Link>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => removeArticle(item.id, e)}
                      className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-600 transition"
                      title="हटाउनुहोस्"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {articles.length > 0 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                <span>स्थानीय यन्त्रमा सुरक्षित (Saved locally in browser)</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
