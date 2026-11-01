'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/context/language-context'
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface ArticleItem {
  id: string
  title: string
  slug: string
  subtitle: string | null
  excerpt: string | null
  featuredImage: string | null
  status: 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'
  isBreaking: boolean
  isFeatured: boolean
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
  _count: {
    comments: number
  }
}

export default function ArticlesListPage() {
  const { language } = useLanguage()

  const [articles, setArticles] = React.useState<ArticleItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [statusFilter, setStatusFilter] = React.useState<string>('')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalArticles, setTotalArticles] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  const fetchArticles = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '10')
      if (statusFilter) params.set('status', statusFilter)
      if (searchTerm) params.set('search', searchTerm)

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
  }, [page, statusFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchArticles()
  }

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
        setSuccessMsg(language === 'ne' ? 'समाचार सफलतापूर्वक हटाइयो।' : 'Article deleted successfully.')
        fetchArticles()
      } else {
        alert(data.error || 'Failed to delete article.')
      }
    } catch {
      alert('Network error while deleting.')
    }
  }

  const statusBadges: Record<string, { labelEn: string; labelNe: string; color: string }> = {
    PUBLISHED: {
      labelEn: 'Published',
      labelNe: 'प्रकाशित',
      color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
    },
    DRAFT: {
      labelEn: 'Draft',
      labelNe: 'मस्यौदा',
      color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    },
    REVIEW: {
      labelEn: 'In Review',
      labelNe: 'समीक्षामा',
      color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400 border-amber-300 dark:border-amber-800',
    },
    SCHEDULED: {
      labelEn: 'Scheduled',
      labelNe: 'तालिकाबद्ध',
      color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-400 border-blue-300 dark:border-blue-800',
    },
    ARCHIVED: {
      labelEn: 'Archived',
      labelNe: 'अर्काइभ',
      color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-400 border-purple-300 dark:border-purple-800',
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-600" />
            <span>{language === 'ne' ? 'समाचार व्यवस्थापन' : 'Article Management'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'ne'
              ? 'समाचारहरू लेख्ने, सम्पादन गर्ने, समीक्षा गर्ने, तालिका बनाउने र प्रकाशित गर्ने कक्ष।'
              : 'Draft, edit, review, schedule, and publish news articles across categories.'}
          </p>
        </div>

        <Link
          href="/admin/articles/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow"
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

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
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
              onClick={() => {
                setStatusFilter(tab.key)
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === tab.key
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {language === 'ne' ? tab.labelNe : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ne' ? 'शीर्षक खोज्नुहोस्...' : 'Search articles...'}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Articles Table */}
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
                    {language === 'ne' ? 'समाचारहरू लोड हुँदैछन्...' : 'Loading articles...'}
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600 dark:text-slate-300">
                      {language === 'ne' ? 'कुनै समाचार भेटिएन।' : 'No articles found.'}
                    </p>
                    <Link
                      href="/admin/articles/create"
                      className="inline-block mt-2 text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                    >
                      {language === 'ne' ? 'पहिलो समाचार लेख्नुहोस् →' : 'Write the first article →'}
                    </Link>
                  </td>
                </tr>
              ) : (
                articles.map((art) => {
                  const badge = statusBadges[art.status] || statusBadges.DRAFT
                  return (
                    <tr key={art.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      {/* Title & Preview */}
                      <td className="px-5 py-4 max-w-md">
                        <div className="flex items-start gap-3">
                          {art.featuredImage ? (
                            <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 dark:border-slate-800">
                              <Image
                                src={art.featuredImage}
                                alt={art.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center text-slate-400">
                              <FileText className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
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
                            </div>
                            <Link
                              href={`/admin/articles/${art.id}/edit`}
                              className="font-bold text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition line-clamp-1 text-sm"
                            >
                              {art.title}
                            </Link>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                              /{art.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {language === 'ne' ? art.category.nameNe : art.category.nameEn}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}
                        >
                          {language === 'ne' ? badge.labelNe : badge.labelEn}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-medium">
                        {art.author.fullName}
                      </td>

                      {/* Views */}
                      <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-400">
                        {art.viewCount.toLocaleString()}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-slate-500 text-[11px]">
                        {new Date(art.publishedAt || art.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/articles/${art.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(art)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
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
              Total: {totalArticles} {language === 'ne' ? 'समाचार' : 'articles'}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono font-bold">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
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
