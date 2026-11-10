'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/context/language-context'
import {
  FileText,
  Plus,
  Search,
  X,
  Eye,
  Edit,
  Trash2,
  Clock,
  Flame,
  Star,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Radio,
  FolderTree,
  SlidersHorizontal,
  RotateCcw,
  ArrowUpDown,
  TrendingUp,
  Pin,
} from 'lucide-react'

interface CategoryItem {
  id: number
  nameEn: string
  nameNe: string
  slug: string
  _count?: {
    articles: number
  }
}

interface ArticleItem {
  id: string
  title: string
  slug: string
  subtitle: string | null
  excerpt: string | null
  featuredImage: string | null
  videoUrl?: string | null
  status: 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'
  isBreaking: boolean
  isFeatured: boolean
  isTrending?: boolean
  isCategoryLead?: boolean
  viewCount: number
  readTimeMinutes: number
  publishedAt: string | null
  createdAt: string
  author: {
    id: string
    fullName: string
    email: string
  }
  category: {
    id: number
    nameEn: string
    nameNe: string
    slug: string
  }
  province?: string | null
  _count: {
    comments: number
  }
}

export default function ArticlesListPage() {
  const { language } = useLanguage()

  const [articles, setArticles] = React.useState<ArticleItem[]>([])
  const [categories, setCategories] = React.useState<CategoryItem[]>([])
  const [loading, setLoading] = React.useState(true)

  // Filters state
  const [statusFilter, setStatusFilter] = React.useState<string>('')
  const [categoryFilter, setCategoryFilter] = React.useState<string>('')
  const [provinceFilter, setProvinceFilter] = React.useState<string>('')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [onlyFeatured, setOnlyFeatured] = React.useState(false)
  const [onlyBreaking, setOnlyBreaking] = React.useState(false)
  const [sortBy, setSortBy] = React.useState<string>('newest')

  // Pagination state
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalArticles, setTotalArticles] = React.useState(0)

  // Notifications
  const [error, setError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  // 1. Fetch available categories on mount
  React.useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories)
        }
      })
      .catch((err) => console.error('Failed to load categories:', err))
  }, [])

  // 2. Debounce search term by 350ms for smooth live search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 350)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // 3. Main article fetcher
  const fetchArticles = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '10')
      if (statusFilter) params.set('status', statusFilter)
      if (categoryFilter) params.set('categoryId', categoryFilter)
      if (provinceFilter) params.set('province', provinceFilter)
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (onlyFeatured) params.set('isFeatured', 'true')
      if (onlyBreaking) params.set('isBreaking', 'true')
      if (sortBy) params.set('sortBy', sortBy)

      const res = await fetch(`/api/admin/articles?${params.toString()}`)
      const data = await res.json()

      if (res.ok) {
        setArticles(data.articles || [])
        setTotalPages(data.pagination.totalPages || 1)
        setTotalArticles(data.pagination.total || 0)
      } else {
        setError(data.error || 'Failed to fetch articles.')
      }
    } catch {
      setError('Network error while retrieving articles.')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchArticles()
  }, [page, statusFilter, categoryFilter, provinceFilter, debouncedSearch, onlyFeatured, onlyBreaking, sortBy])

  // Reset all filters helper
  const handleResetFilters = () => {
    setStatusFilter('')
    setCategoryFilter('')
    setProvinceFilter('')
    setSearchTerm('')
    setDebouncedSearch('')
    setOnlyFeatured(false)
    setOnlyBreaking(false)
    setSortBy('newest')
    setPage(1)
  }

  const hasActiveFilters =
    Boolean(statusFilter) ||
    Boolean(categoryFilter) ||
    Boolean(searchTerm) ||
    onlyFeatured ||
    onlyBreaking ||
    sortBy !== 'newest'

  const handleDelete = async (article: ArticleItem) => {
    if (
      !confirm(
        language === 'ne'
          ? `के तपाईं "${article.title}" समाचार मेटाउन निश्चित हुनुहुन्छ?`
          : `Are you sure you want to delete "${article.title}"?`
      )
    ) {
      return
    }

    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setSuccessMsg(
          language === 'ne' ? 'समाचार सफलतापूर्वक हटाइयो।' : 'Article deleted successfully.'
        )
        fetchArticles()
      } else {
        alert(data.error || 'Failed to delete article.')
      }
    } catch {
      alert('Network error while deleting.')
    }
  }

  // 1-Click Quick Status Toggle (Draft <-> Published)
  const handleQuickToggleStatus = async (article: ArticleItem) => {
    const nextStatus = article.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (res.ok) {
        setSuccessMsg(
          nextStatus === 'PUBLISHED'
            ? language === 'ne'
              ? `"${article.title}" प्रत्यक्ष प्रकाशित भयो!`
              : `"${article.title}" is now Published Live!`
            : language === 'ne'
            ? `"${article.title}" मस्यौदामा सारियो।`
            : `"${article.title}" moved to Draft.`
        )
        fetchArticles()
      }
    } catch {
      console.error('Failed to toggle article status')
    }
  }

  const getArticleThumb = (art: ArticleItem): string | null => {
    if (art.featuredImage) return art.featuredImage
    if (art.videoUrl) {
      const url = art.videoUrl
      let ytId: string | null = null
      if (url.includes('youtu.be/')) ytId = url.split('youtu.be/')[1].split(/[?&/"']/)[0]
      else if (url.includes('youtube.com/watch')) {
        const m = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/)
        if (m) ytId = m[1]
      } else if (url.includes('/embed/')) ytId = url.split('/embed/')[1].split(/[?&/"']/)[0]
      if (ytId) return `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
    }
    return null
  }

  const statusBadges: Record<string, { labelEn: string; labelNe: string; color: string }> = {
    PUBLISHED: {
      labelEn: 'Published',
      labelNe: 'प्रकाशित',
      color:
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
    },
    DRAFT: {
      labelEn: 'Draft',
      labelNe: 'मस्यौदा',
      color:
        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    },
    REVIEW: {
      labelEn: 'In Review',
      labelNe: 'समीक्षामा',
      color:
        'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400 border-amber-300 dark:border-amber-800',
    },
    SCHEDULED: {
      labelEn: 'Scheduled',
      labelNe: 'तालिकाबद्ध',
      color:
        'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-400 border-blue-300 dark:border-blue-800',
    },
    ARCHIVED: {
      labelEn: 'Archived',
      labelNe: 'अर्काइभ',
      color:
        'bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-400 border-purple-300 dark:border-purple-800',
    },
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-600" />
            <span>{language === 'ne' ? 'समाचार व्यवस्थापन' : 'Article Management'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'ne'
              ? 'समाचारहरू विधा अनुसार खोज्ने, सम्पादन गर्ने, समीक्षा गर्ने र प्रकाशित गर्ने कक्ष।'
              : 'Filter articles category-wise, edit, review, and manage editorial publications.'}
          </p>
        </div>

        <Link
          href="/admin/articles/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ne' ? 'नयाँ समाचार लेख्नुहोस्' : 'Write New Article'}</span>
        </Link>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-2 text-xs text-red-800 dark:text-red-300">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* POWERFUL SEARCH & MULTI-FILTER CONTROL BAR */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3.5">
        
        {/* ROW 1: Status Filter Tabs & Live Instant Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { key: '', labelEn: 'All', labelNe: 'सबै' },
              { key: 'PUBLISHED', labelEn: 'Published', labelNe: 'प्रकाशित' },
              { key: 'DRAFT', labelEn: 'Drafts', labelNe: 'मस्यौदा' },
              { key: 'REVIEW', labelEn: 'In Review', labelNe: 'समीक्षा' },
              { key: 'SCHEDULED', labelEn: 'Scheduled', labelNe: 'तालिका' },
              { key: 'ARCHIVED', labelEn: 'Archived', labelNe: 'अर्काइभ' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.key)
                  setPage(1)
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.key
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {language === 'ne' ? tab.labelNe : tab.labelEn}
              </button>
            ))}
          </div>

          {/* Live Instant Search Bar with Clear Button */}
          <div className="relative w-full lg:w-80 shrink-0">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                language === 'ne'
                  ? 'शीर्षक, लेखक वा शब्द खोज्नुहोस्...'
                  : 'Search by title, author, slug...'
              }
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                title="खोजी हटाउनुहोस्"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ROW 2: Category Dropdown Selector, Special Flags, Sorting & Reset */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Dropdown (Category-Wise Separation) */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <FolderTree className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
              <label htmlFor="categoryFilterSelect" className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {language === 'ne' ? 'विधा:' : 'Category:'}
              </label>
              <select
                id="categoryFilterSelect"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setPage(1)
                }}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-1"
              >
                <option value="" className="dark:bg-slate-900 text-slate-900 dark:text-white">
                  {language === 'ne' ? 'सबै विधाहरू (All Categories)' : 'All Categories'}
                </option>
                {categories.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    className="dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {language === 'ne' ? cat.nameNe : cat.nameEn} (
                    {language === 'ne' ? cat.nameEn : cat.nameNe})
                    {typeof cat._count?.articles === 'number' ? ` • ${cat._count.articles}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Province Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <label htmlFor="provinceFilterSelect" className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {language === 'ne' ? 'प्रदेश:' : 'Province:'}
              </label>
              <select
                id="provinceFilterSelect"
                value={provinceFilter}
                onChange={(e) => {
                  setProvinceFilter(e.target.value)
                  setPage(1)
                }}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-1"
              >
                <option value="" className="dark:bg-slate-900 text-slate-900 dark:text-white">
                  {language === 'ne' ? 'सबै प्रदेश (All Provinces)' : 'All Provinces'}
                </option>
                <option value="koshi" className="dark:bg-slate-900 text-slate-900 dark:text-white">कोशी (Koshi)</option>
                <option value="madhesh" className="dark:bg-slate-900 text-slate-900 dark:text-white">मधेश (Madhesh)</option>
                <option value="bagmati" className="dark:bg-slate-900 text-slate-900 dark:text-white">बागमती (Bagmati)</option>
                <option value="gandaki" className="dark:bg-slate-900 text-slate-900 dark:text-white">गण्डकी (Gandaki)</option>
                <option value="lumbini" className="dark:bg-slate-900 text-slate-900 dark:text-white">लुम्बिनी (Lumbini)</option>
                <option value="karnali" className="dark:bg-slate-900 text-slate-900 dark:text-white">कर्णाली (Karnali)</option>
                <option value="sudurpashchim" className="dark:bg-slate-900 text-slate-900 dark:text-white">सुदूरपश्चिम (Sudurpashchim)</option>
              </select>
            </div>

            {/* Quick Flag: Featured Story */}
            <button
              type="button"
              onClick={() => {
                setOnlyFeatured(!onlyFeatured)
                setPage(1)
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                onlyFeatured
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFeatured ? 'fill-white' : 'text-amber-500'}`} />
              <span>{language === 'ne' ? 'प्रमुख मात्र' : 'Featured Only'}</span>
            </button>

            {/* Quick Flag: Breaking News */}
            <button
              type="button"
              onClick={() => {
                setOnlyBreaking(!onlyBreaking)
                setPage(1)
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                onlyBreaking
                  ? 'bg-red-600 text-white border-red-700 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${onlyBreaking ? 'fill-white' : 'text-red-500'}`} />
              <span>{language === 'ne' ? 'ताजा खबर मात्र' : 'Breaking Only'}</span>
            </button>
          </div>

          {/* Sort By Dropdown & Reset Filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                aria-label="क्रमबद्ध गर्नुहोस्"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value)
                  setPage(1)
                }}
                className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="newest" className="dark:bg-slate-900">
                  {language === 'ne' ? 'नयाँ पहिले (Newest)' : 'Newest First'}
                </option>
                <option value="views" className="dark:bg-slate-900">
                  {language === 'ne' ? 'धेरै हेरिएको (Most Views)' : 'Most Views'}
                </option>
                <option value="oldest" className="dark:bg-slate-900">
                  {language === 'ne' ? 'पुरानो पहिले (Oldest)' : 'Oldest First'}
                </option>
                <option value="title" className="dark:bg-slate-900">
                  {language === 'ne' ? 'शीर्षक क्रम (Title A-Z)' : 'Title (A-Z)'}
                </option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900 transition cursor-pointer"
                title="सबै फिल्टर रिसेट गर्नुहोस्"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{language === 'ne' ? 'रिसेट' : 'Reset'}</span>
              </button>
            )}
          </div>
        </div>

        {/* ROW 3: Active Filters Summary Tag Bar */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-slate-400">
              {language === 'ne' ? 'सक्रिय फिल्टरहरू:' : 'Active filters:'}
            </span>

            {categoryFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold">
                <span>
                  {language === 'ne' ? 'विधा:' : 'Category:'}{' '}
                  {categories.find((c) => String(c.id) === categoryFilter)?.nameNe ||
                    categoryFilter}
                </span>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('')}
                  className="hover:text-blue-900 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {statusFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-[11px] font-bold">
                <span>
                  {language === 'ne' ? 'स्थिति:' : 'Status:'}{' '}
                  {statusBadges[statusFilter]?.labelNe || statusFilter}
                </span>
                <button
                  type="button"
                  onClick={() => setStatusFilter('')}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {provinceFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#02267C] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold">
                <span>
                  {language === 'ne' ? 'प्रदेश:' : 'Province:'} {provinceFilter}
                </span>
                <button
                  type="button"
                  onClick={() => setProvinceFilter('')}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {debouncedSearch && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold">
                <span>
                  {language === 'ne' ? 'खोजी:' : 'Search:'} "{debouncedSearch}"
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    setDebouncedSearch('')
                  }}
                  className="hover:text-amber-950 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {onlyFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 text-[11px] font-bold">
                <span>★ {language === 'ne' ? 'प्रमुख' : 'Featured'}</span>
                <button
                  type="button"
                  onClick={() => setOnlyFeatured(false)}
                  className="hover:text-amber-950 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {onlyBreaking && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 text-[11px] font-bold">
                <span>⚡ {language === 'ne' ? 'ताजा खबर' : 'Breaking'}</span>
                <button
                  type="button"
                  onClick={() => setOnlyBreaking(false)}
                  className="hover:text-red-900 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <span className="ml-auto text-[11px] font-bold text-slate-500">
              {language === 'ne'
                ? `जम्मा ${totalArticles} वटा समाचार भेटियो`
                : `Found ${totalArticles} articles`}
            </span>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* ARTICLES TABLE */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">{language === 'ne' ? 'समाचार' : 'Article'}</th>
                <th className="px-5 py-3.5">{language === 'ne' ? 'विधा' : 'Category'}</th>
                <th className="px-5 py-3.5">{language === 'ne' ? 'स्थिति' : 'Status'}</th>
                <th className="px-5 py-3.5">{language === 'ne' ? 'लेखक' : 'Author'}</th>
                <th className="px-5 py-3.5">{language === 'ne' ? 'हेराइ' : 'Views'}</th>
                <th className="px-5 py-3.5">{language === 'ne' ? 'मिति' : 'Date'}</th>
                <th className="px-5 py-3.5 text-right">{language === 'ne' ? 'कार्य' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>{language === 'ne' ? 'समाचारहरू खोज्दै...' : 'Searching articles...'}</span>
                    </div>
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">
                      {hasActiveFilters
                        ? language === 'ne'
                          ? 'यस विधा वा खोजी सर्तमा कुनै समाचार भेटिएन।'
                          : 'No articles found matching this filter.'
                        : language === 'ne'
                        ? 'कुनै समाचार भेटिएन।'
                        : 'No articles found.'}
                    </p>
                    {hasActiveFilters ? (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-block mt-2.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition cursor-pointer"
                      >
                        {language === 'ne' ? 'सबै फिल्टर हटाउनुहोस्' : 'Reset all filters'}
                      </button>
                    ) : (
                      <Link
                        href="/admin/articles/create"
                        className="inline-block mt-2 text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                      >
                        {language === 'ne' ? 'पहिलो समाचार लेख्नुहोस् →' : 'Write the first article →'}
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                articles.map((art) => {
                  const badge = statusBadges[art.status] || statusBadges.DRAFT
                  return (
                    <tr
                      key={art.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group"
                    >
                      {/* Title & Preview */}
                      <td className="px-5 py-4 max-w-md">
                        <div className="flex items-start gap-3">
                          {(() => {
                            const thumb = getArticleThumb(art)
                            const isMp4 =
                              thumb?.toLowerCase().endsWith('.mp4') ||
                              thumb?.toLowerCase().endsWith('.webm') ||
                              art.videoUrl?.toLowerCase().endsWith('.mp4') ||
                              art.videoUrl?.toLowerCase().endsWith('.webm')
                            return thumb ? (
                              <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 dark:border-slate-800">
                                {isMp4 && !art.featuredImage ? (
                                  <video
                                    src={art.videoUrl || thumb}
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Image
                                    src={thumb}
                                    alt={art.title}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                                {art.videoUrl && (
                                  <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-red-600 text-white text-[8px] font-black uppercase">
                                    ▶ VID
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="w-16 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center text-slate-400">
                                <FileText className="w-5 h-5" />
                              </div>
                            )
                          })()}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              {art.isBreaking && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white animate-pulse">
                                  <Flame className="w-3 h-3" />
                                  <span>{language === 'ne' ? 'ताजा' : 'BREAKING'}</span>
                                </span>
                              )}
                              {art.isFeatured && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                                  ★ {language === 'ne' ? 'प्रमुख' : 'Featured'}
                                </span>
                              )}
                              {art.isTrending && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-300 dark:border-orange-800">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>{language === 'ne' ? 'ट्रेन्डिङ' : 'Trending'}</span>
                                </span>
                              )}
                              {art.isCategoryLead && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                                  <Pin className="w-3 h-3" />
                                  <span>{language === 'ne' ? 'विधा मुख्य' : 'Category Lead'}</span>
                                </span>
                              )}
                            </div>
                            <Link
                              href={`/admin/articles/${art.id}/edit`}
                              className="font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-1 text-sm block"
                            >
                              {art.title}
                            </Link>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                              /{art.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Province */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            {language === 'ne' ? art.category.nameNe : art.category.nameEn}
                          </span>
                          {art.province && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-[#02267C] dark:text-blue-300 border border-blue-200 dark:border-blue-800 capitalize">
                              📍 {art.province}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status (1-Click Toggle between Published & Draft) */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleQuickToggleStatus(art)}
                          title={
                            art.status === 'PUBLISHED'
                              ? 'Click to move to Draft'
                              : 'Click to Publish Live immediately'
                          }
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer hover:scale-105 transition ${badge.color}`}
                        >
                          {language === 'ne' ? badge.labelNe : badge.labelEn}
                        </button>
                      </td>

                      {/* Author */}
                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-medium">
                        {art.author.fullName}
                      </td>

                      {/* Views */}
                      <td className="px-5 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {art.viewCount.toLocaleString()}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(art.publishedAt || art.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Live Updates Coverage */}
                          <Link
                            href={`/admin/articles/${art.id}/live`}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                            title={language === 'ne' ? 'प्रत्यक्ष कभरेज' : 'Live Updates'}
                          >
                            <Radio className="w-4 h-4" />
                          </Link>

                          {/* Edit Article */}
                          <Link
                            href={`/admin/articles/${art.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Delete Article */}
                          <button
                            type="button"
                            onClick={() => handleDelete(art)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              {language === 'ne' ? 'कुल' : 'Total'}: {totalArticles}{' '}
              {language === 'ne' ? 'समाचार' : 'articles'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono font-bold">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
