'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/language-context'
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Loader2,
  ArrowRight,
  Folder,
  History,
  CornerDownLeft,
} from 'lucide-react'

interface SearchResultArticle {
  id: string
  title: string
  slug: string
  subtitle?: string | null
  excerpt?: string | null
  featuredImage?: string | null
  publishedAt: string | null
  readTimeMinutes?: number
  category: {
    id: number
    nameEn: string
    nameNe: string
    slug: string
  }
}

interface SearchResultCategory {
  id: number
  nameEn: string
  nameNe: string
  slug: string
}

const RECENT_SEARCHES_KEY = 'sabaichha_recent_searches'
const MAX_RECENT_SEARCHES = 5

const TRENDING_SEARCHES = {
  ne: ['राजनीति', 'अर्थतन्त्र', 'नेपाल क्रिकेट', 'सुनको भाउ', 'मौसम', 'प्रतिनिधिसभा'],
  en: ['Politics', 'Economy', 'Nepal Cricket', 'Gold Rate', 'Weather', 'Parliament'],
}

export function GlobalSearchBar() {
  const router = useRouter()
  const { language, t } = useLanguage()
  const isNe = language === 'ne'

  const [query, setQuery] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [articles, setArticles] = React.useState<SearchResultArticle[]>([])
  const [categories, setCategories] = React.useState<SearchResultCategory[]>([])
  const [total, setTotal] = React.useState(0)
  const [recentSearches, setRecentSearches] = React.useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = React.useState<number>(-1)
  const [isMac, setIsMac] = React.useState(false)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  // Detect OS for shortcut badge
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent))
    }
  }, [])

  // Load recent searches from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) {
        setRecentSearches(JSON.parse(stored))
      }
    } catch {}
  }, [])

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    try {
      const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(
        0,
        MAX_RECENT_SEARCHES
      )
      setRecentSearches(updated)
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
    } catch {}
  }

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = recentSearches.filter((s) => s !== term)
    setRecentSearches(updated)
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
    } catch {}
  }

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation()
    setRecentSearches([])
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY)
    } catch {}
  }

  // Global Keyboard shortcut: Ctrl+K or Cmd+K or "/"
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input, textarea or contentEditable
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      } else if (e.key === '/' && !isInput) {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  // Click outside listener
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Perform search query with debounce
  const fetchSearchResults = React.useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setArticles([])
      setCategories([])
      setTotal(0)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm.trim())}&limit=5`)
      if (res.ok) {
        const data = await res.json()
        setArticles(data.articles || [])
        setCategories(data.categories || [])
        setTotal(data.total || 0)
      }
    } catch (err) {
      console.error('Live search error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    setSelectedIndex(-1)
    if (!isOpen) setIsOpen(true)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (!val.trim()) {
      setArticles([])
      setCategories([])
      setTotal(0)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    debounceTimerRef.current = setTimeout(() => {
      fetchSearchResults(val)
    }, 220)
  }

  const executeSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim()
    if (!trimmed) return
    saveRecentSearch(trimmed)
    setIsOpen(false)
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIndex >= 0 && articles[selectedIndex]) {
      const art = articles[selectedIndex]
      saveRecentSearch(query)
      setIsOpen(false)
      router.push(`/news/${art.slug}`)
    } else {
      executeSearch(query)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        return
      }
      setSelectedIndex((prev) => (prev < articles.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : articles.length - 1))
    }
  }

  const clearInput = () => {
    setQuery('')
    setArticles([])
    setCategories([])
    setTotal(0)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const trendingList = isNe ? TRENDING_SEARCHES.ne : TRENDING_SEARCHES.en

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0 md:w-80 lg:w-96 md:flex-initial">
      {/* 1. Main Search Bar Input */}
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={t('searchPlaceholder') || (isNe ? 'समाचार खोज्नुहोस्...' : 'Search news...')}
            className="w-full pl-9 pr-16 py-2 text-xs rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600 transition shadow-2xs"
            autoComplete="off"
            spellCheck="false"
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {isLoading && (
              <Loader2 className="w-3.5 h-3.5 text-red-600 animate-spin" />
            )}

            {query && !isLoading && (
              <button
                type="button"
                onClick={clearInput}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                title={isNe ? 'खाली गर्नुहोस्' : 'Clear'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {!query && (
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md select-none pointer-events-none">
                {isMac ? '⌘K' : 'Ctrl K'}
              </kbd>
            )}
          </div>
        </div>
      </form>

      {/* 2. Interactive Search Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          
          {/* CASE A: User has not typed anything yet -> Show Recent & Trending Searches */}
          {!query.trim() && (
            <div className="p-4 space-y-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isNe ? 'हालै खोजिएका' : 'Recent Searches'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={clearAllRecent}
                      className="text-[10px] text-red-600 hover:underline cursor-pointer lowercase"
                    >
                      {isNe ? 'सबै हटाउनुहोस्' : 'Clear all'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => executeSearch(term)}
                        className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer border border-slate-200 dark:border-slate-700"
                      >
                        <Clock className="w-3 h-3 text-slate-400 group-hover:text-red-500" />
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(term, e)}
                          className="text-slate-400 hover:text-red-600 ml-0.5 p-0.5 rounded-full"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                  <span>{isNe ? 'चर्चामा रहेका विषयहरू' : 'Trending Topics'}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {trendingList.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => executeSearch(topic)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer border border-slate-200/80 dark:border-slate-700/80"
                    >
                      <span className="text-red-600 font-bold">#</span>
                      <span>{topic}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{isNe ? 'कुनै पनि शब्द टाइप गरी खोज्नुहोस्' : 'Type keywords to search news'}</span>
                <span className="text-[10px] font-mono">Press Esc to close</span>
              </div>
            </div>
          )}

          {/* CASE B: User is typing -> Show Live Matches */}
          {query.trim() && (
            <div>
              {/* Category shortcuts if found */}
              {categories.length > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {isNe ? 'सम्बन्धित विधा' : 'Matching Categories'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-red-600 hover:text-white text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
                      >
                        <Folder className="w-3.5 h-3.5 text-red-600" />
                        <span>{isNe ? cat.nameNe : cat.nameEn}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Articles */}
              {articles.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[360px] overflow-y-auto">
                  <div className="px-3.5 py-2 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>{isNe ? 'ताजा समाचार नतिजा' : 'Matching Articles'}</span>
                    <span className="text-red-600 font-mono">
                      {isNe ? `${total} समाचार` : `${total} found`}
                    </span>
                  </div>

                  {articles.map((art, idx) => {
                    const isSelected = idx === selectedIndex
                    return (
                      <Link
                        key={art.id}
                        href={`/news/${art.slug}`}
                        onClick={() => {
                          saveRecentSearch(query)
                          setIsOpen(false)
                        }}
                        className={`p-3 flex items-start gap-3 transition block ${
                          isSelected
                            ? 'bg-red-50/60 dark:bg-red-950/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {art.featuredImage ? (
                          <div className="relative w-14 h-11 rounded-lg overflow-hidden shrink-0 bg-slate-950">
                            <Image
                              src={art.featuredImage}
                              alt={art.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center">
                            <Search className="w-4 h-4 text-slate-400" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                              {isNe ? art.category.nameNe : art.category.nameEn}
                            </span>
                            {art.publishedAt && (
                              <span className="text-[10px] text-slate-400">
                                • {new Date(art.publishedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                            {art.title}
                          </h4>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : !isLoading ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isNe
                      ? `"${query}" सँग सम्बन्धित कुनै समाचार फेला परेन`
                      : `No news found for "${query}"`}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isNe
                      ? 'अन्य शब्द वा श्रेणीको नाम प्रयोग गरी पुन: प्रयास गर्नुहोस्।'
                      : 'Try checking your spelling or using different keywords.'}
                  </p>
                </div>
              ) : null}

              {/* View all results footer */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => executeSearch(query)}
                  className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>
                    {isNe
                      ? `"${query}" का सबै नतिजा हेर्नुहोस् (${total})`
                      : `View all results for "${query}" (${total})`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
