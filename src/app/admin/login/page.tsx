'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/language-context'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const { language } = useLanguage()

  const [email, setEmail] = React.useState('admin@sabaichha.com')
  const [password, setPassword] = React.useState('Admin@123456')
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in.')
      }

      if (data.mustChangePassword) {
        window.location.href = '/admin/change-password'
      } else {
        window.location.href = '/admin'
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Top utility row */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {language === 'ne' ? 'प्रशासन तथा समाचार कक्ष पोर्टल' : 'Editorial & Admin Portal'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
          {/* Brand Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative h-16 w-64 mb-3 bg-white rounded-xl p-1.5 shadow-2xs">
              <Image
                src="/logo.jpg"
                alt="SabaiChha.com"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {language === 'ne' ? 'कर्मचारी लगइन' : 'Newsroom Sign In'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {language === 'ne'
                ? 'आफ्नो अधिकार प्राप्त इमेल र पासवर्ड प्रविष्ट गर्नुहोस्'
                : 'Enter your authorized credentials to access editorial tools'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {language === 'ne' ? 'इमेल ठेगाना' : 'Email Address'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@sabaichha.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {language === 'ne' ? 'पासवर्ड' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 active:scale-[0.99] transition shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <span>{isLoading ? (language === 'ne' ? 'लगइन हुँदैछ...' : 'Signing In...') : (language === 'ne' ? 'सुरक्षित लगइन' : 'Sign In')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Development Quick Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'ne'
                ? 'मूल सुपर एडमिन: admin@sabaichha.com (पासवर्ड: Admin@123456)'
                : 'Default Super Admin: admin@sabaichha.com (Password: Admin@123456)'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 SabaiChha.com. Restricted Access.</p>
      </div>
    </div>
  )
}
