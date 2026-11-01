'use client'

import * as React from 'react'
import { useLanguage } from '@/context/language-context'
import {
  MessageSquare,
  Send,
  CornerDownRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
} from 'lucide-react'

interface CommentItem {
  id: string
  authorName: string
  content: string
  parentId: string | null
  createdAt: string | Date
  replies?: CommentItem[]
}

interface CommentSectionProps {
  articleId: string
  articleTitle: string
}

const AVATAR_BG_COLORS = [
  'bg-red-600 text-white',
  'bg-blue-600 text-white',
  'bg-emerald-600 text-white',
  'bg-amber-600 text-white',
  'bg-purple-600 text-white',
  'bg-rose-600 text-white',
]

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_BG_COLORS[Math.abs(hash) % AVATAR_BG_COLORS.length]
}

function formatRelativeTime(dateString: string | Date, lang: 'ne' | 'en') {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return lang === 'ne' ? 'भर्खरै' : 'Just now'
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return lang === 'ne'
      ? `${diffInMinutes} मिनेट अगाडि`
      : `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return lang === 'ne'
      ? `${diffInHours} घण्टा अगाडि`
      : `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return lang === 'ne'
      ? `${diffInDays} दिन अगाडि`
      : `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }
  return date.toLocaleDateString(lang === 'ne' ? 'ne-NP' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function CommentSection({ articleId, articleTitle }: CommentSectionProps) {
  const { language } = useLanguage()

  const [comments, setComments] = React.useState<CommentItem[]>([])
  const [totalCount, setTotalCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  // Top-level comment form states
  const [authorName, setAuthorName] = React.useState('')
  const [authorEmail, setAuthorEmail] = React.useState('')
  const [content, setContent] = React.useState('')
  const [honeypot, setHoneypot] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [submitSuccess, setSubmitSuccess] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Reply form states
  const [replyingToId, setReplyingToId] = React.useState<string | null>(null)
  const [replyName, setReplyName] = React.useState('')
  const [replyEmail, setReplyEmail] = React.useState('')
  const [replyContent, setReplyContent] = React.useState('')
  const [replySubmitting, setReplySubmitting] = React.useState(false)
  const [replySuccess, setReplySuccess] = React.useState(false)
  const [replyError, setReplyError] = React.useState<string | null>(null)

  const fetchComments = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?articleId=${articleId}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments || [])
        setTotalCount(data.totalCount || 0)
      }
    } catch (err) {
      console.error('Failed to load comments:', err)
    } finally {
      setLoading(false)
    }
  }, [articleId])

  React.useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSubmitSuccess(false)

    if (!authorName.trim() || !authorEmail.trim() || !content.trim()) {
      setErrorMessage(
        language === 'ne'
          ? 'कृपया आफ्नो नाम, इमेल र प्रतिक्रिया सबै भर्नुहोस्।'
          : 'Please fill out your name, email, and comment.'
      )
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim(),
          content: content.trim(),
          honeypot,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit comment')
      }

      setSubmitSuccess(true)
      setContent('')
      setAuthorName('')
      setAuthorEmail('')
      // Keep success notice visible for a bit
      setTimeout(() => setSubmitSuccess(false), 8000)
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          (language === 'ne'
            ? 'प्रतिक्रिया पठाउन सकिएन। पुन: प्रयास गर्नुहोस्।'
            : 'Could not post comment. Please try again.')
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault()
    setReplyError(null)
    setReplySuccess(false)

    if (!replyName.trim() || !replyEmail.trim() || !replyContent.trim()) {
      setReplyError(
        language === 'ne'
          ? 'कृपया सबै विवरणहरू भर्नुहोस्।'
          : 'Please fill all required fields.'
      )
      return
    }

    setReplySubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          parentId,
          authorName: replyName.trim(),
          authorEmail: replyEmail.trim(),
          content: replyContent.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit reply')
      }

      setReplySuccess(true)
      setReplyContent('')
      setReplyName('')
      setReplyEmail('')
      setTimeout(() => {
        setReplySuccess(false)
        setReplyingToId(null)
      }, 5000)
    } catch (err: any) {
      setReplyError(
        err.message ||
          (language === 'ne'
            ? 'जवाफ पठाउन सकिएन। पुन: प्रयास गर्नुहोस्।'
            : 'Could not submit reply. Please try again.')
      )
    } finally {
      setReplySubmitting(false)
    }
  }

  return (
    <section className="pt-10 border-t-2 border-red-600/60 dark:border-red-600/40 space-y-8" id="comments">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{language === 'ne' ? 'पाठक प्रतिक्रिया' : 'Reader Comments'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-bold border border-red-200 dark:border-red-900">
                {totalCount}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'ne'
                ? 'यस समाचारप्रति आफ्ना विचार तथा टिप्पणीहरू व्यक्त गर्नुहोस्'
                : 'Join the conversation and share your perspective'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Comment Submission Card */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xs">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600"></span>
          <span>{language === 'ne' ? 'तपाईंको विचार राख्नुहोस्' : 'Leave a Comment'}</span>
        </h4>

        {submitSuccess && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {language === 'ne' ? 'प्रतिक्रिया दर्ता भयो!' : 'Comment Submitted!'}
              </p>
              <p className="text-xs mt-0.5 leading-relaxed">
                {language === 'ne'
                  ? 'धन्यवाद! तपाईंको टिप्पणी प्राप्त भयो। सम्पादकीय आचारसंहिता समीक्षापछि यो प्रकाशित हुनेछ।'
                  : 'Thank you! Your comment has been received and will be published following editorial compliance review.'}
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{language === 'ne' ? 'त्रुटि' : 'Error'}</p>
              <p className="text-xs mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot field for anti-bot defense */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'ne' ? 'पूरा नाम *' : 'Full Name *'}
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder={language === 'ne' ? 'उदा. सन्तोष श्रेष्ठ' : 'e.g. John Doe'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>{language === 'ne' ? 'इमेल ठेगाना *' : 'Email Address *'}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {language === 'ne' ? '(सार्वजनिक गरिने छैन)' : '(Will not be published)'}
                </span>
              </label>
              <input
                type="email"
                required
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder={language === 'ne' ? 'yourname@example.com' : 'yourname@example.com'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{language === 'ne' ? 'तपाईंको विचार / टिप्पणी *' : 'Your Comment *'}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {content.length}/2000
              </span>
            </label>
            <textarea
              required
              rows={4}
              maxLength={2000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                language === 'ne'
                  ? 'यस समाचारसम्बन्धी मर्यादित र रचनात्मक विचार लेख्नुहोस्...'
                  : 'Write your constructive thoughts on this story...'
              }
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition resize-y"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {language === 'ne'
                  ? 'प्रेस काउन्सिल नेपालको आचारसंहिताअनुसार मर्यादित अभिव्यक्ति मात्र मान्य हुनेछ।'
                  : 'All comments adhere to ethical press standards and pre-moderation.'}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 hover:shadow-red-600/30 active:scale-98 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'ne' ? 'पठाउँदै...' : 'Submitting...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'ne' ? 'प्रतिक्रिया पठाउनुहोस्' : 'Post Comment'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
            <span>{language === 'ne' ? 'प्रतिक्रियाहरू लोड हुँदैछ...' : 'Loading comments...'}</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="py-10 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8">
            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {language === 'ne' ? 'कुनै प्रतिक्रिया दर्ता भएको छैन' : 'No comments yet'}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {language === 'ne'
                ? 'यस समाचारमा पहिलो विचार तपाईंको हुनसक्छ। माथिको फारमबाट प्रतिक्रिया दिनुहोस्।'
                : 'Be the first to share your thoughts on this article using the form above.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4"
              >
                {/* Main Comment Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm uppercase shadow-2xs ${getAvatarColor(
                        comment.authorName
                      )}`}
                    >
                      {comment.authorName.charAt(0)}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {comment.authorName}
                      </h5>
                      <span className="text-[11px] text-slate-400">
                        {formatRelativeTime(comment.createdAt, language)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setReplyingToId(replyingToId === comment.id ? null : comment.id)
                    }
                    className="text-xs font-semibold text-red-600 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1 px-3 py-1 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>{language === 'ne' ? 'जवाफ' : 'Reply'}</span>
                  </button>
                </div>

                {/* Main Comment Body */}
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line pl-12">
                  {comment.content}
                </p>

                {/* Inline Reply Form */}
                {replyingToId === comment.id && (
                  <div className="mt-4 ml-8 sm:ml-12 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>
                        {language === 'ne'
                          ? `${comment.authorName} लाई जवाफ दिँदै`
                          : `Replying to ${comment.authorName}`}
                      </span>
                      <button
                        onClick={() => setReplyingToId(null)}
                        className="text-slate-400 hover:text-slate-600 text-[11px]"
                      >
                        {language === 'ne' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                      </button>
                    </div>

                    {replySuccess && (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {language === 'ne'
                            ? 'जवाफ दर्ता भयो! सम्पादकीय समीक्षापछि देखिनेछ।'
                            : 'Reply submitted! Awaiting editorial moderation.'}
                        </span>
                      </div>
                    )}

                    {replyError && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs">
                        {replyError}
                      </div>
                    )}

                    <form
                      onSubmit={(e) => handleReplySubmit(e, comment.id)}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={replyName}
                          onChange={(e) => setReplyName(e.target.value)}
                          placeholder={language === 'ne' ? 'तपाईंको नाम *' : 'Your Name *'}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                        />
                        <input
                          type="email"
                          required
                          value={replyEmail}
                          onChange={(e) => setReplyEmail(e.target.value)}
                          placeholder={language === 'ne' ? 'इमेल (गोप्य रहनेछ) *' : 'Email (confidential) *'}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <textarea
                        required
                        rows={3}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={
                          language === 'ne'
                            ? 'आफ्नो जवाफ यहाँ लेख्नुहोस्...'
                            : 'Write your reply...'
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white resize-y"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={replySubmitting}
                          className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                        >
                          {replySubmitting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>{language === 'ne' ? 'जवाफ पठाउनुहोस्' : 'Post Reply'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-6 sm:ml-10 pl-4 border-l-2 border-red-200 dark:border-red-950 space-y-3.5">
                    {comment.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="bg-slate-50 dark:bg-slate-950/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs uppercase ${getAvatarColor(
                              reply.authorName
                            )}`}
                          >
                            {reply.authorName.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">
                              {reply.authorName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatRelativeTime(reply.createdAt, language)}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed pl-9">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
