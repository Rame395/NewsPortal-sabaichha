'use client'

import * as React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/language-context'
import {
  Radio,
  Send,
  Trash2,
  ExternalLink,
  Clock,
  Flame,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  RefreshCw,
} from 'lucide-react'

interface LiveUpdateItem {
  id: string
  headline: string
  content: string
  createdAt: string
  author: {
    id: string
    fullName: string
    email: string
  }
}

interface LiveCoverageManagerProps {
  article: {
    id: string
    title: string
    slug: string
    status: string
    isBreaking: boolean
  }
  initialUpdates: LiveUpdateItem[]
}

export function LiveCoverageManager({ article, initialUpdates }: LiveCoverageManagerProps) {
  const { language } = useLanguage()

  const [updates, setUpdates] = React.useState<LiveUpdateItem[]>(initialUpdates)
  const [headline, setHeadline] = React.useState('')
  const [content, setContent] = React.useState('')
  const [markBreaking, setMarkBreaking] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [refreshing, setRefreshing] = React.useState(false)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const reloadUpdates = async () => {
    setRefreshing(true)
    try {
      const res = await fetch(`/api/admin/articles/${article.id}/live`)
      if (res.ok) {
        const data = await res.json()
        setUpdates(data.updates || [])
      }
    } catch (err) {
      console.error('Failed to reload live updates:', err)
    } finally {
      setRefreshing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!headline.trim() || !content.trim()) {
      setErrorMsg(
        language === 'ne'
          ? 'कृपया शीर्षक र विवरण दुवै भर्नुहोस्।'
          : 'Please enter both headline and content for the update.'
      )
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/articles/${article.id}/live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: headline.trim(),
          content: content.trim(),
          markBreaking,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to post live update')
      }

      setHeadline('')
      setContent('')
      setSuccessMsg(
        language === 'ne'
          ? 'प्रत्यक्ष अपडेट सफलतापूर्वक प्रकाशित भयो!'
          : 'Live update posted successfully!'
      )
      setTimeout(() => setSuccessMsg(null), 4000)
      reloadUpdates()
    } catch (err: any) {
      setErrorMsg(err.message || 'Error publishing live update')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (updateId: string) => {
    if (
      !confirm(
        language === 'ne'
          ? 'के तपाईं यो प्रत्यक्ष अपडेट हटाउन चाहनुहुन्छ?'
          : 'Are you sure you want to retract/delete this live update entry?'
      )
    ) {
      return
    }

    setDeletingId(updateId)
    try {
      const res = await fetch(`/api/admin/articles/${article.id}/live/${updateId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setUpdates((prev) => prev.filter((u) => u.id !== updateId))
        setSuccessMsg(language === 'ne' ? 'अपडेट हटाइयो।' : 'Update retracted.')
        setTimeout(() => setSuccessMsg(null), 3000)
      }
    } catch (err) {
      console.error('Failed to delete live update:', err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/articles"
          className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'ne' ? 'समाचार सूचीमा फर्कनुहोस्' : 'Back to Articles'}</span>
        </Link>

        <Link
          href={`/news/${article.slug}`}
          target="_blank"
          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition"
        >
          <span>{language === 'ne' ? 'सार्वजनिक पाठक पृष्ठ' : 'View Public Live View'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-400">
              {language === 'ne' ? 'प्रत्यक्ष कभरेज डेस्क' : 'Live Coverage Desk'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black leading-tight text-white line-clamp-2">
            {article.title}
          </h1>
          <p className="text-xs text-slate-400">
            {language === 'ne'
              ? 'यहाँबाट पोस्ट गरिएका अपडेटहरू पाठकको स्क्रिनमा प्रत्यक्ष रूपमा देखा पर्नेछन्।'
              : 'Updates posted here will stream immediately to reader screens.'}
          </p>
        </div>

        <button
          onClick={reloadUpdates}
          disabled={refreshing}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center gap-2 transition cursor-pointer self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-red-400' : ''}`} />
          <span>{language === 'ne' ? 'ताजा गर्नुहोस्' : 'Refresh Feed'}</span>
        </button>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Fast Rapid-Post Editor */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Radio className="w-4 h-4 text-red-600" />
          <span>{language === 'ne' ? 'नयाँ लाइभ अपडेट पोस्ट गर्नुहोस्' : 'Post New Live Update'}</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {language === 'ne' ? 'ताजा शीर्षक / अलर्ट *' : 'Update Headline / Alert *'}
            </label>
            <input
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder={
                language === 'ne'
                  ? 'उदा: मन्त्रिपरिषद् बैठक सुरु, मुख्य एजेन्डामा छलफल हुँदै'
                  : 'e.g. Cabinet meeting begins; major national agenda underway'
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{language === 'ne' ? 'अपडेटको विस्तृत विवरण *' : 'Detailed Content / Notes *'}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {content.length}/5000
              </span>
            </label>
            <textarea
              required
              rows={4}
              maxLength={5000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                language === 'ne'
                  ? 'घटनाक्रम, प्रत्यक्ष विवरण, आधिकारिक भनाइ वा मुख्य बुँदाहरू यहाँ लेख्नुहोस्...'
                  : 'Enter the developing details, live quotes, or key takeaways...'
              }
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition resize-y font-serif"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={markBreaking}
                onChange={(e) => setMarkBreaking(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-600" />
                {language === 'ne'
                  ? 'यसलाई ब्रेकिङ टिकरमा पनि देखाउनुहोस्'
                  : 'Display on public Breaking News ticker'}
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 hover:shadow-red-600/30 active:scale-98 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'ne' ? 'प्रकाशन हुँदैछ...' : 'Publishing...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'ne' ? 'अपडेट प्रकाशित गर्नुहोस्' : 'Publish Live Update'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Published Timeline Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span>{language === 'ne' ? 'प्रकाशित लाइभ फिड' : 'Published Live Feed'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              {updates.length}
            </span>
          </h3>
        </div>

        {updates.length === 0 ? (
          <div className="py-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-2xs">
            <Radio className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {language === 'ne' ? 'कुनै लाइभ अपडेट पोस्ट गरिएको छैन' : 'No live updates posted yet'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'ne'
                ? 'माथिको फारम प्रयोग गरेर पहिलो प्रत्यक्ष अपडेट प्रकाशित गर्नुहोस्।'
                : 'Use the rapid-post editor above to push the first real-time update.'}
            </p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 border-l-2 border-red-600/70 space-y-6">
            {updates.map((item, idx) => (
              <div key={item.id} className="relative group">
                {/* Timeline Node Dot */}
                <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white ring-4 ring-white dark:ring-slate-950">
                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                </span>

                {/* Update Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-red-600" />
                        <span>
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {item.author.fullName}
                        </span>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                            Latest
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white mt-1 leading-snug">
                        {item.headline}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                      title="Retract / Delete update"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-serif pt-1">
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
