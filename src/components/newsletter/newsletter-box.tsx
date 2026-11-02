'use client'

import * as React from 'react'
import { Mail, CheckCircle2, AlertCircle, Send, Sparkles } from 'lucide-react'
import { useLanguage } from '@/context/language-context'

export function NewsletterBox({ variant = 'default' }: { variant?: 'default' | 'card' }) {
  const { language } = useLanguage()
  const [email, setEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setSuccess(
          language === 'ne'
            ? 'तपाईंको इमेल दर्ता भयो! धन्यवाद।'
            : 'Subscribed successfully! Thank you.'
        )
        setEmail('')
      } else {
        setError(data.error || 'Something went wrong.')
      }
    } catch {
      setError('Failed to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-linear-to-r from-red-600 to-rose-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'ne' ? 'निःशुल्क डिजिटल बुलेटिन' : 'Free Morning Briefing'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            {language === 'ne'
              ? 'दैनिक बिहानी समाचार बुलेटिन'
              : 'Subscribe to Daily Morning Digest'}
          </h3>
          <p className="text-xs sm:text-sm text-red-100 max-w-lg leading-relaxed">
            {language === 'ne'
              ? 'देश-विदेशका प्रमुख १० ताजा समाचार तथा गहन विश्लेषण हरेक बिहान तपाईंको इनबक्समा!'
              : 'Top 10 national and world developments curated by our editors directly in your inbox.'}
          </p>
        </div>

        {/* Subscribe Form */}
        <form onSubmit={handleSubmit} className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={language === 'ne' ? 'तपाईंको इमेल ठेगाना...' : 'Enter your email...'}
              className="w-full sm:w-72 px-4 py-3 pl-10 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-white shadow-md"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {loading
                ? language === 'ne'
                  ? 'दर्ता गर्दै...'
                  : 'Subscribing...'
                : language === 'ne'
                ? 'दर्ता गर्नुहोस्'
                : 'Subscribe'}
            </span>
          </button>
        </form>
      </div>

      {success && (
        <div className="mt-4 p-3 rounded-xl bg-white/20 backdrop-blur-xs flex items-center gap-2 text-xs font-bold text-white max-w-lg mx-auto text-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-amber-300" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-black/40 backdrop-blur-xs flex items-center gap-2 text-xs font-bold text-red-200 max-w-lg mx-auto text-center justify-center">
          <AlertCircle className="w-4 h-4 text-white" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
