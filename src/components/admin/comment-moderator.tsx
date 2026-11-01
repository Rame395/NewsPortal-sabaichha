'use client'

import * as React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/language-context'
import {
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Search,
  ExternalLink,
  CornerDownRight,
  RefreshCw,
  CheckCheck,
  ShieldAlert,
  Loader2,
  Check,
  Clock,
  Filter,
} from 'lucide-react'

interface CommentData {
  id: string
  articleId: string
  authorName: string
  authorEmail: string
  content: string
  status: 'PENDING' | 'APPROVED' | 'SPAM'
  parentId: string | null
  createdAt: string
  article: {
    id: string
    title: string
    slug: string
  }
  parent?: {
    id: string
    authorName: string
    content: string
  } | null
}

interface CountsData {
  pending: number
  approved: number
  spam: number
  all: number
}

export function CommentModerator() {
  const { language } = useLanguage()

  const [activeTab, setActiveTab] = React.useState<'PENDING' | 'APPROVED' | 'SPAM' | 'ALL'>('PENDING')
  const [comments, setComments] = React.useState<CommentData[]>([])
  const [counts, setCounts] = React.useState<CountsData>({ pending: 0, approved: 0, spam: 0, all: 0 })
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)

  // Selection state for batch moderation
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [actionInProgress, setActionInProgress] = React.useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null)

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const loadComments = React.useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (activeTab !== 'ALL') {
        queryParams.set('status', activeTab)
      }
      if (debouncedSearch.trim()) {
        queryParams.set('q', debouncedSearch.trim())
      }
      queryParams.set('page', page.toString())
      queryParams.set('limit', '20')

      const res = await fetch(`/api/admin/comments?${queryParams.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments || [])
        if (data.counts) setCounts(data.counts)
        if (data.pagination) setTotalPages(data.pagination.totalPages || 1)
      }
    } catch (err) {
      console.error('Failed to load comments for moderation:', err)
    } finally {
      setLoading(false)
    }
  }, [activeTab, debouncedSearch, page])

  React.useEffect(() => {
    loadComments()
  }, [loadComments])

  // Single action: update comment status
  const handleStatusChange = async (id: string, newStatus: 'APPROVED' | 'SPAM' | 'PENDING') => {
    setActionInProgress(id)
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setFeedbackMessage(
          language === 'ne'
            ? `प्रतिक्रिया स्थिति "${newStatus}" मा परिवर्तन गरियो`
            : `Status changed to ${newStatus}`
        )
        setTimeout(() => setFeedbackMessage(null), 3000)
        loadComments()
      }
    } catch (err) {
      console.error('Failed to update comment status:', err)
    } finally {
      setActionInProgress(null)
    }
  }

  // Single action: delete comment
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        language === 'ne'
          ? 'के तपाईं यो प्रतिक्रिया सधैंका लागि हटाउन निश्चित हुनुहुन्छ?'
          : 'Are you sure you want to permanently delete this comment?'
      )
    ) {
      return
    }

    setActionInProgress(id)
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setFeedbackMessage(
          language === 'ne' ? 'प्रतिक्रिया हटाइयो' : 'Comment deleted'
        )
        setTimeout(() => setFeedbackMessage(null), 3000)
        setSelectedIds((prev) => prev.filter((item) => item !== id))
        loadComments()
      }
    } catch (err) {
      console.error('Failed to delete comment:', err)
    } finally {
      setActionInProgress(null)
    }
  }

  // Batch actions
  const handleBulkAction = async (action: 'APPROVE' | 'SPAM' | 'DELETE') => {
    if (selectedIds.length === 0) return

    if (
      action === 'DELETE' &&
      !confirm(
        language === 'ne'
          ? `के तपाईं छनोट गरिएका ${selectedIds.length} प्रतिक्रियाहरू हटाउन निश्चित हुनुहुन्छ?`
          : `Permanently delete ${selectedIds.length} comments?`
      )
    ) {
      return
    }

    setActionInProgress('bulk')
    try {
      const res = await fetch('/api/admin/comments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action }),
      })

      if (res.ok) {
        setSelectedIds([])
        setFeedbackMessage(
          language === 'ne'
            ? `${selectedIds.length} प्रतिक्रियाहरू सफलतापूर्वक प्रशोधन गरियो`
            : `Successfully processed ${selectedIds.length} comments`
        )
        setTimeout(() => setFeedbackMessage(null), 3000)
        loadComments()
      }
    } catch (err) {
      console.error('Bulk action failed:', err)
    } finally {
      setActionInProgress(null)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === comments.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(comments.map((c) => c.id))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-red-600" />
            <span>{language === 'ne' ? 'प्रतिक्रिया व्यवस्थापन' : 'Comments Moderation'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'ne'
              ? 'पाठकहरूका विचारहरूको सम्पादकीय समीक्षा, स्वीकृति, स्पाम नियन्त्रण तथा व्यवस्थापन'
              : 'Review, approve, spam-filter, and moderate reader comments across all articles'}
          </p>
        </div>

        <button
          onClick={loadComments}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : ''}`} />
          <span>{language === 'ne' ? 'ताजा गर्नुहोस्' : 'Refresh'}</span>
        </button>
      </div>

      {/* Floating feedback alert */}
      {feedbackMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Status Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => {
            setActiveTab('PENDING')
            setPage(1)
            setSelectedIds([])
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'PENDING'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{language === 'ne' ? 'लम्बित' : 'Pending'}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'PENDING'
                ? 'bg-white/20 text-white'
                : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
            }`}
          >
            {counts.pending}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('APPROVED')
            setPage(1)
            setSelectedIds([])
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'APPROVED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>{language === 'ne' ? 'स्वीकृत' : 'Approved'}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'APPROVED'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
            }`}
          >
            {counts.approved}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('SPAM')
            setPage(1)
            setSelectedIds([])
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'SPAM'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{language === 'ne' ? 'स्प्याम' : 'Spam'}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'SPAM'
                ? 'bg-white/20 text-white'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
            }`}
          >
            {counts.spam}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('ALL')
            setPage(1)
            setSelectedIds([])
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{language === 'ne' ? 'सबै' : 'All'}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'ALL'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {counts.all}
          </span>
        </button>
      </div>

      {/* Search and Bulk Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              language === 'ne'
                ? 'नाम, इमेल, प्रतिक्रिया वा समाचार खोज्नुहोस्...'
                : 'Search author, email, comment, or article title...'
            }
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition"
          />
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 px-2">
              {selectedIds.length} {language === 'ne' ? 'छानियो' : 'selected'}
            </span>
            <button
              onClick={() => handleBulkAction('APPROVE')}
              disabled={actionInProgress === 'bulk'}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{language === 'ne' ? 'स्वीकृत गर्नुहोस्' : 'Approve'}</span>
            </button>
            <button
              onClick={() => handleBulkAction('SPAM')}
              disabled={actionInProgress === 'bulk'}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{language === 'ne' ? 'स्प्याम' : 'Mark Spam'}</span>
            </button>
            <button
              onClick={() => handleBulkAction('DELETE')}
              disabled={actionInProgress === 'bulk'}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'ne' ? 'हटाउनुहोस्' : 'Delete'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {/* Select All Checkbox Row */}
        {comments.length > 0 && (
          <div className="flex items-center gap-2 px-2 text-xs text-slate-500">
            <input
              type="checkbox"
              id="select-all"
              checked={selectedIds.length === comments.length && comments.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <label htmlFor="select-all" className="cursor-pointer font-semibold">
              {language === 'ne' ? 'सबै चयन गर्नुहोस्' : 'Select All on this page'}
            </label>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
            <span>{language === 'ne' ? 'प्रतिक्रियाहरू लोड गरिँदैछ...' : 'Loading comments...'}</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-2xs">
            <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {language === 'ne' ? 'कुनै प्रतिक्रिया फेला परेन' : 'No comments found'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'ne'
                ? 'यस विधामा हाल कुनै प्रतिक्रिया दर्ता छैन।'
                : 'There are currently no comments matching your criteria.'}
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-2xs transition space-y-3 ${
                selectedIds.includes(comment.id)
                  ? 'border-red-600 ring-2 ring-red-600/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Header row: Checkbox, Author, Email, Article context, Status pill */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(comment.id)}
                    onChange={() => toggleSelectOne(comment.id)}
                    className="w-4 h-4 mt-1 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {comment.authorName}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        ({comment.authorEmail})
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • {new Date(comment.createdAt).toLocaleString(language === 'ne' ? 'ne-NP' : 'en-US')}
                      </span>
                    </div>

                    {/* Article title context */}
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-400">
                        {language === 'ne' ? 'समाचार:' : 'Article:'}
                      </span>
                      <Link
                        href={`/news/${comment.article.slug}`}
                        target="_blank"
                        className="font-bold text-red-600 hover:text-red-700 dark:hover:text-red-400 inline-flex items-center gap-1 max-w-md truncate"
                      >
                        <span className="truncate">{comment.article.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </Link>
                    </div>

                    {/* If replying to another comment */}
                    {comment.parent && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                        <CornerDownRight className="w-3 h-3 text-red-600" />
                        <span>
                          {language === 'ne'
                            ? `जवाफ: ${comment.parent.authorName} लाई - "${comment.parent.content.slice(0, 40)}..."`
                            : `In reply to: ${comment.parent.authorName} - "${comment.parent.content.slice(0, 40)}..."`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      comment.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400'
                        : comment.status === 'SPAM'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-400 animate-pulse'
                    }`}
                  >
                    {comment.status}
                  </span>
                </div>
              </div>

              {/* Comment Content Box */}
              <div className="bg-slate-50/70 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line ml-7">
                {comment.content}
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex items-center justify-end gap-2 pt-1 ml-7">
                {comment.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleStatusChange(comment.id, 'APPROVED')}
                    disabled={actionInProgress === comment.id}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{language === 'ne' ? 'स्वीकृत गर्नुहोस्' : 'Approve'}</span>
                  </button>
                )}

                {comment.status !== 'SPAM' && (
                  <button
                    onClick={() => handleStatusChange(comment.id, 'SPAM')}
                    disabled={actionInProgress === comment.id}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{language === 'ne' ? 'स्प्याम चिन्ह लगाउनुहोस्' : 'Mark Spam'}</span>
                  </button>
                )}

                {comment.status !== 'PENDING' && (
                  <button
                    onClick={() => handleStatusChange(comment.id, 'PENDING')}
                    disabled={actionInProgress === comment.id}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-60"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{language === 'ne' ? 'लम्बितमा राख्नुहोस्' : 'Move to Pending'}</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={actionInProgress === comment.id}
                  className="px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-60"
                  title="Delete comment permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'ne' ? 'हटाउनुहोस्' : 'Delete'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500">
            {language === 'ne'
              ? `पृष्ठ ${page} / ${totalPages}`
              : `Page ${page} of ${totalPages}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 text-xs font-bold transition"
            >
              {language === 'ne' ? 'अघिल्लो' : 'Previous'}
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 text-xs font-bold transition"
            >
              {language === 'ne' ? 'पछिल्लो' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
