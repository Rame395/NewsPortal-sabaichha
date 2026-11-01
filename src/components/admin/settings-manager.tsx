'use client'

import * as React from 'react'
import { useLanguage } from '@/context/language-context'
import { AllSettings, DEFAULT_SITE_SETTINGS } from '@/lib/settings'
import {
  Settings,
  Building,
  Share2,
  TrendingUp,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Sun,
  Coins,
  DollarSign,
  Shield,
} from 'lucide-react'

// Custom SVGs for Times of India-style social icons
export function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

export function TwitterXIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function YoutubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

export function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

export function LinkedinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  )
}

export function TelegramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.46c.535-.194 1.006.128.832.941z" />
    </svg>
  )
}

export function SettingsManager({ initialSettings }: { initialSettings: AllSettings }) {
  const { language } = useLanguage()

  const [settings, setSettings] = React.useState<AllSettings>(initialSettings)
  const [activeTab, setActiveTab] = React.useState<'site' | 'social' | 'tickers' | 'footer'>('social')
  const [saving, setSaving] = React.useState(false)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      const data = await res.json()
      if (res.ok) {
        setSuccessMsg(
          language === 'ne'
            ? 'सेटिङ्स सफलतापूर्वक सुरक्षित गरियो!'
            : 'Settings saved and synced across header, footer & public feeds!'
        )
        setTimeout(() => setSuccessMsg(null), 4000)
      } else {
        setErrorMsg(data.error || 'Failed to save settings')
      }
    } catch {
      setErrorMsg('Network error while saving settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-red-600" />
            <span>{language === 'ne' ? 'पोर्टल सेटिङ्स तथा फुटर विवरण' : 'Portal Settings & Social Links'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'ne'
              ? 'हेडर, फुटर, सामाजिक सञ्जाल, कार्यालय ठेगाना र प्रत्यक्ष बजार/मौसम दरहरू व्यवस्थापन गर्नुहोस्'
              : 'Customize header & footer details, social media handles, contact info, and live market rates'}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 hover:shadow-red-600/30 active:scale-98 transition flex items-center gap-2 cursor-pointer disabled:opacity-60 self-start sm:self-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{language === 'ne' ? 'परिवर्तन सुरक्षित गर्नुहोस्' : 'Save All Changes'}</span>
        </button>
      </div>

      {/* Floating feedback alert */}
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

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'social'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{language === 'ne' ? 'सामाजिक सञ्जाल (Social Icons)' : 'Social Links (TOI Style)'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tickers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'tickers'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{language === 'ne' ? 'मौसम तथा बजार दर (Weather & Rates)' : 'Live Weather & Market Rates'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('site')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'site'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>{language === 'ne' ? 'कार्यालय तथा सम्पर्क (Contact Info)' : 'General & Contact Info'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('footer')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'footer'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{language === 'ne' ? 'फुटर तथा प्रतिलिपि अधिकार' : 'Footer & Legal'}</span>
        </button>
      </div>

      {/* Main Settings Card */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: SOCIAL MEDIA LINKS (Times of India style) */}
        {activeTab === 'social' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'ne'
                  ? 'टाइम्स अफ इन्डिया शैलीका सामाजिक सञ्जाल लिङ्कहरू'
                  : 'Social Media Links (Times of India Style Header & Footer Icons)'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {language === 'ne'
                  ? 'यहाँ भरिएका सामाजिक लिङ्कहरू हेडरको माथिल्लो पट्टी र फुटरमा गोलाकार आइकनका रूपमा प्रत्यक्ष देखिनेछन्।'
                  : 'These links will render directly in the top utility bar and footer with authentic circular badges.'}
              </p>
            </div>

            {/* Live Visual Preview Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {language === 'ne' ? 'प्रत्यक्ष पूर्वावलोकन (Live Header Preview)' : 'Live Header Icon Preview'}
              </span>
              <div className="flex items-center gap-2 py-2">
                <a
                  href={settings.socialLinks.facebook || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full border border-[#1877F2]/40 text-[#1877F2] hover:bg-[#1877F2] hover:text-white flex items-center justify-center transition shadow-2xs"
                  title="Facebook"
                >
                  <FacebookIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href={settings.socialLinks.twitter || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full border border-slate-700/40 text-slate-900 dark:text-slate-100 hover:bg-black hover:text-white flex items-center justify-center transition shadow-2xs"
                  title="X (Twitter)"
                >
                  <TwitterXIcon className="w-3 h-3" />
                </a>
                <a
                  href={settings.socialLinks.youtube || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full border border-[#FF0000]/40 text-[#FF0000] hover:bg-[#FF0000] hover:text-white flex items-center justify-center transition shadow-2xs"
                  title="YouTube"
                >
                  <YoutubeIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href={settings.socialLinks.instagram || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full border border-[#E4405F]/40 text-[#E4405F] hover:bg-[#E4405F] hover:text-white flex items-center justify-center transition shadow-2xs"
                  title="Instagram"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href={settings.socialLinks.linkedin || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full border border-[#0A66C2]/40 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white flex items-center justify-center transition shadow-2xs"
                  title="LinkedIn"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href={settings.socialLinks.telegram || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full border border-[#229ED9]/40 text-[#229ED9] hover:bg-[#229ED9] hover:text-white flex items-center justify-center transition shadow-2xs"
                  title="Telegram"
                >
                  <TelegramIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FacebookIcon className="w-4 h-4 text-[#1877F2]" />
                  <span>Facebook Page URL</span>
                </label>
                <input
                  type="url"
                  value={settings.socialLinks.facebook}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, facebook: e.target.value },
                    })
                  }
                  placeholder="https://facebook.com/sabaichha"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <TwitterXIcon className="w-3.5 h-3.5" />
                  <span>X (Twitter) Profile URL</span>
                </label>
                <input
                  type="url"
                  value={settings.socialLinks.twitter}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, twitter: e.target.value },
                    })
                  }
                  placeholder="https://x.com/sabaichha"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <YoutubeIcon className="w-4 h-4 text-[#FF0000]" />
                  <span>YouTube Channel URL</span>
                </label>
                <input
                  type="url"
                  value={settings.socialLinks.youtube}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, youtube: e.target.value },
                    })
                  }
                  placeholder="https://youtube.com/@sabaichha"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <InstagramIcon className="w-4 h-4 text-[#E4405F]" />
                  <span>Instagram Profile URL</span>
                </label>
                <input
                  type="url"
                  value={settings.socialLinks.instagram}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, instagram: e.target.value },
                    })
                  }
                  placeholder="https://instagram.com/sabaichha"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <LinkedinIcon className="w-4 h-4 text-[#0A66C2]" />
                  <span>LinkedIn Page URL</span>
                </label>
                <input
                  type="url"
                  value={settings.socialLinks.linkedin}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, linkedin: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/company/sabaichha"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
                  <span>Telegram Channel URL</span>
                </label>
                <input
                  type="url"
                  value={settings.socialLinks.telegram}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, telegram: e.target.value },
                    })
                  }
                  placeholder="https://t.me/sabaichha"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE WEATHER & MARKET RATES (Gold, NEPSE, Forex) */}
        {activeTab === 'tickers' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" />
                <span>{language === 'ne' ? 'प्रत्यक्ष मौसम तथा आर्थिक बजार दरहरू' : 'Live Weather & Market Tickers'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {language === 'ne'
                  ? 'टाइम्स अफ इन्डिया जस्तै हेडर पट्टीमा तापक्रम (Open-Meteo API बाट), सुन/चाँदीको भाउ, नेप्से परिसूचक र अमेरिकी डलरको विनिमय दर देखाउनुहोस्।'
                  : 'Live temperature from Open-Meteo public API, bullion gold/silver rates, NEPSE index, and USD forex rate.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Weather Settings */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>{language === 'ne' ? 'मौसम (Live Weather API)' : 'Weather Widget'}</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.liveTickers.showWeather}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          liveTickers: { ...settings.liveTickers, showWeather: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'ne' ? 'सहरको नाम (नेपाली)' : 'City (Nepali)'}
                  </label>
                  <input
                    type="text"
                    value={settings.liveTickers.weatherCity}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        liveTickers: { ...settings.liveTickers, weatherCity: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Gold & Silver */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>{language === 'ne' ? 'सुन / चाँदीको दर (Gold & Silver)' : 'Bullion Rates'}</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.liveTickers.showGold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          liveTickers: { ...settings.liveTickers, showGold: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'ne' ? 'प्रतितोला सुन (रु)' : 'Gold / Tola (NPR)'}
                    </label>
                    <input
                      type="text"
                      value={settings.liveTickers.goldRate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          liveTickers: { ...settings.liveTickers, goldRate: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'ne' ? 'प्रतितोला चाँदी (रु)' : 'Silver / Tola (NPR)'}
                    </label>
                    <input
                      type="text"
                      value={settings.liveTickers.silverRate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          liveTickers: { ...settings.liveTickers, silverRate: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* NEPSE Stock Market */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>{language === 'ne' ? 'नेप्से सेयर बजार (NEPSE Stock)' : 'NEPSE Stock Market'}</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.liveTickers.showNepse}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          liveTickers: { ...settings.liveTickers, showNepse: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'ne' ? 'परिसूचक (Points)' : 'Index Points'}
                    </label>
                    <input
                      type="text"
                      value={settings.liveTickers.nepseIndex}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          liveTickers: { ...settings.liveTickers, nepseIndex: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'ne' ? 'परिवर्तन (Change)' : 'Change / %'}
                    </label>
                    <input
                      type="text"
                      value={settings.liveTickers.nepseChange}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          liveTickers: { ...settings.liveTickers, nepseChange: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Forex (USD) */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-blue-500" />
                    <span>{language === 'ne' ? 'मुद्रा विनिमय दर (USD Forex)' : 'Forex Exchange Rate'}</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.liveTickers.showForex}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          liveTickers: { ...settings.liveTickers, showForex: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'ne' ? '१ अमेरिकी डलर बराबर नेपाली रुपैयाँ (रु)' : 'USD to NPR Exchange Rate'}
                  </label>
                  <input
                    type="text"
                    value={settings.liveTickers.forexUsd}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        liveTickers: { ...settings.liveTickers, forexUsd: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTACT & GENERAL INFO */}
        {activeTab === 'site' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'ne' ? 'कार्यालय, सम्पर्क तथा दर्ता विवरण' : 'Office, Contact & Legal Registration'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {language === 'ne'
                  ? 'प्रेस काउन्सिल नेपालको मापदण्डअनुसार पत्रिकाको फुटर तथा हाम्रो बारेमा खण्डमा देखिने विवरण।'
                  : 'Compliance and institutional details rendered across portal footers.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ne' ? 'पोर्टलको नाम' : 'Portal Name'}
                </label>
                <input
                  type="text"
                  value={settings.siteInfo.portalName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      siteInfo: { ...settings.siteInfo, portalName: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ne' ? 'मुख्य नारा (नेपाली)' : 'Slogan (Nepali)'}
                </label>
                <input
                  type="text"
                  value={settings.siteInfo.sloganNe}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      siteInfo: { ...settings.siteInfo, sloganNe: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  <span>{language === 'ne' ? 'कार्यालय ठेगाना (नेपाली)' : 'Office Address (Nepali)'}</span>
                </label>
                <input
                  type="text"
                  value={settings.siteInfo.addressNe}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      siteInfo: { ...settings.siteInfo, addressNe: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'ne' ? 'सम्पर्क फोन / हटलाइन' : 'Telephone / Hotline'}</span>
                </label>
                <input
                  type="text"
                  value={settings.siteInfo.phone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      siteInfo: { ...settings.siteInfo, phone: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>{language === 'ne' ? 'आधिकारिक इमेल' : 'Official Email'}</span>
                </label>
                <input
                  type="email"
                  value={settings.siteInfo.email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      siteInfo: { ...settings.siteInfo, email: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-red-600" />
                  <span>{language === 'ne' ? 'प्रेस काउन्सिल दर्ता नं.' : 'Press Council Reg. No.'}</span>
                </label>
                <input
                  type="text"
                  value={settings.siteInfo.pressCouncilNo}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      siteInfo: { ...settings.siteInfo, pressCouncilNo: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ne' ? 'प्रधान सम्पादक' : 'Editor-in-Chief'}
                </label>
                <input
                  type="text"
                  value={settings.siteInfo.editorName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      siteInfo: { ...settings.siteInfo, editorName: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ne' ? 'प्रकाशन संस्था / कम्पनी' : 'Publisher Network'}
                </label>
                <input
                  type="text"
                  value={settings.siteInfo.publisherName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      siteInfo: { ...settings.siteInfo, publisherName: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FOOTER BIO & COPYRIGHT */}
        {activeTab === 'footer' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'ne' ? 'फुटर परिचय तथा प्रतिलिपि अधिकार' : 'Footer Bio & Copyright Statement'}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ne' ? 'हाम्रो बारेमा छोटो परिचय (नेपाली)' : 'About Portal (Nepali)'}
                </label>
                <textarea
                  rows={3}
                  value={settings.footer.aboutNe}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      footer: { ...settings.footer, aboutNe: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ne' ? 'प्रतिलिपि अधिकार सूचना (Copyright Statement)' : 'Copyright Notice'}
                </label>
                <input
                  type="text"
                  value={settings.footer.copyrightText}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      footer: { ...settings.footer, copyrightText: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
