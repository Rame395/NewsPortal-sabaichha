'use client'

import * as React from 'react'
import { useLanguage } from '@/context/language-context'
import type { AllSettings, TrendingTopicItem, TeamMemberItem, TeamDepartment } from '@/lib/settings/types'
import { DEFAULT_SITE_SETTINGS, DEFAULT_TEAM_SETTINGS } from '@/lib/settings/defaults'
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
  Flame,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Users,
  UserCheck,
  UserPlus,
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

export function TikTokIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  )
}

export function SettingsManager({ initialSettings }: { initialSettings: AllSettings }) {
  const { language } = useLanguage()

  const [settings, setSettings] = React.useState<AllSettings>(() => ({
    ...initialSettings,
    trendingTopics: initialSettings.trendingTopics || DEFAULT_SITE_SETTINGS.trendingTopics,
    team: initialSettings.team || DEFAULT_TEAM_SETTINGS,
  }))
  const [activeTab, setActiveTab] = React.useState<'site' | 'social' | 'tickers' | 'trending' | 'footer' | 'team'>('trending')
  const [saving, setSaving] = React.useState(false)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  // New team member form state
  const [newMemberNameNe, setNewMemberNameNe] = React.useState('')
  const [newMemberNameEn, setNewMemberNameEn] = React.useState('')
  const [newMemberRoleNe, setNewMemberRoleNe] = React.useState('')
  const [newMemberRoleEn, setNewMemberRoleEn] = React.useState('')
  const [newMemberDept, setNewMemberDept] = React.useState<TeamDepartment>('EDITORIAL')
  const [newMemberAvatarUrl, setNewMemberAvatarUrl] = React.useState('')
  const [newMemberPhone, setNewMemberPhone] = React.useState('')
  const [newMemberEmail, setNewMemberEmail] = React.useState('')

  const handleAddMember = () => {
    if (!newMemberNameNe.trim() || !newMemberRoleNe.trim()) return

    const newMember: TeamMemberItem = {
      id: Date.now().toString(),
      nameNe: newMemberNameNe.trim(),
      nameEn: newMemberNameEn.trim() || newMemberNameNe.trim(),
      roleNe: newMemberRoleNe.trim(),
      roleEn: newMemberRoleEn.trim() || newMemberRoleNe.trim(),
      department: newMemberDept,
      avatarUrl: newMemberAvatarUrl.trim() || undefined,
      phone: newMemberPhone.trim() || undefined,
      email: newMemberEmail.trim() || undefined,
      orderIndex: (settings.team?.members.length || 0) + 1,
      isActive: true,
    }

    setSettings((prev) => ({
      ...prev,
      team: {
        ...(prev.team || DEFAULT_TEAM_SETTINGS),
        members: [...(prev.team?.members || []), newMember],
      },
    }))

    setNewMemberNameNe('')
    setNewMemberNameEn('')
    setNewMemberRoleNe('')
    setNewMemberRoleEn('')
    setNewMemberAvatarUrl('')
    setNewMemberPhone('')
    setNewMemberEmail('')
  }

  const handleDeleteMember = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      team: {
        ...(prev.team || DEFAULT_TEAM_SETTINGS),
        members: (prev.team?.members || []).filter((m) => m.id !== id),
      },
    }))
  }

  const handleToggleMemberActive = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      team: {
        ...(prev.team || DEFAULT_TEAM_SETTINGS),
        members: (prev.team?.members || []).map((m) =>
          m.id === id ? { ...m, isActive: !m.isActive } : m
        ),
      },
    }))
  }

  const handleMoveMember = (index: number, direction: 'up' | 'down') => {
    const list = [...(settings.team?.members || [])]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= list.length) return
    const temp = list[index]
    list[index] = list[targetIdx]
    list[targetIdx] = temp
    const reordered = list.map((item, idx) => ({ ...item, orderIndex: idx + 1 }))
    setSettings((prev) => ({
      ...prev,
      team: {
        ...(prev.team || DEFAULT_TEAM_SETTINGS),
        members: reordered,
      },
    }))
  }

  // New trending topic form state
  const [newTopicNe, setNewTopicNe] = React.useState('')
  const [newTopicEn, setNewTopicEn] = React.useState('')
  const [newTopicUrl, setNewTopicUrl] = React.useState('')
  const [newTopicIsHot, setNewTopicIsHot] = React.useState(false)

  // Handlers for trending topics
  const handleAddTopic = () => {
    if (!newTopicNe.trim()) return
    const formattedNe = newTopicNe.trim().startsWith('#') ? newTopicNe.trim() : `#${newTopicNe.trim()}`
    const formattedEn = newTopicEn.trim()
      ? newTopicEn.trim().startsWith('#')
        ? newTopicEn.trim()
        : `#${newTopicEn.trim()}`
      : formattedNe

    const newItem: TrendingTopicItem = {
      id: Date.now().toString(),
      labelNe: formattedNe,
      labelEn: formattedEn,
      url: newTopicUrl.trim() || undefined,
      isHot: newTopicIsHot,
      isActive: true,
    }

    setSettings((prev) => ({
      ...prev,
      trendingTopics: {
        ...prev.trendingTopics,
        items: [...prev.trendingTopics.items, newItem],
      },
    }))

    setNewTopicNe('')
    setNewTopicEn('')
    setNewTopicUrl('')
    setNewTopicIsHot(false)
  }

  const handleDeleteTopic = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      trendingTopics: {
        ...prev.trendingTopics,
        items: prev.trendingTopics.items.filter((item) => item.id !== id),
      },
    }))
  }

  const handleToggleTopicActive = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      trendingTopics: {
        ...prev.trendingTopics,
        items: prev.trendingTopics.items.map((item) =>
          item.id === id ? { ...item, isActive: !item.isActive } : item
        ),
      },
    }))
  }

  const handleToggleTopicHot = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      trendingTopics: {
        ...prev.trendingTopics,
        items: prev.trendingTopics.items.map((item) =>
          item.id === id ? { ...item, isHot: !item.isHot } : item
        ),
      },
    }))
  }

  const handleMoveTopic = (index: number, direction: 'up' | 'down') => {
    const items = [...settings.trendingTopics.items]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return

    const temp = items[index]
    items[index] = items[targetIndex]
    items[targetIndex] = temp

    setSettings((prev) => ({
      ...prev,
      trendingTopics: {
        ...prev.trendingTopics,
        items,
      },
    }))
  }

  const handleQuickAddPreset = (labelNe: string, labelEn: string, isHot = false) => {
    if (settings.trendingTopics.items.some((item) => item.labelNe === labelNe)) {
      return
    }
    const newItem: TrendingTopicItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      labelNe,
      labelEn,
      isHot,
      isActive: true,
    }
    setSettings((prev) => ({
      ...prev,
      trendingTopics: {
        ...prev.trendingTopics,
        items: [...prev.trendingTopics.items, newItem],
      },
    }))
  }

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
          onClick={() => setActiveTab('trending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'trending'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>{language === 'ne' ? 'चर्चामा रहेका विषय (Trending Topics)' : 'Trending Topics Ribbon'}</span>
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

        <button
          type="button"
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'team'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-500" />
          <span>{language === 'ne' ? 'हाम्रो टिम (Our Team)' : 'Our Team Members'}</span>
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
                  href={settings.socialLinks.tiktok || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full border border-slate-700 bg-black text-white hover:bg-slate-800 flex items-center justify-center transition shadow-2xs"
                  title="TikTok"
                >
                  <TikTokIcon className="w-3.5 h-3.5" />
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
                  <TikTokIcon className="w-4 h-4 text-black dark:text-white" />
                  <span>TikTok Profile URL</span>
                </label>
                <input
                  type="url"
                  value={settings.socialLinks.tiktok}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, tiktok: e.target.value },
                    })
                  }
                  placeholder="https://tiktok.com/@sabaichha"
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span>{language === 'ne' ? 'सुन / चाँदीको दर' : 'Bullion Rates'}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live API</span>
                    </span>
                  </div>
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

                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {language === 'ne'
                    ? 'लाइभ बुलियन दर स्वतः सिंक हुन्छ। आवश्यक परे तल म्यानुअल ओभरराइड गर्नुहोस्:'
                    : 'Auto-synced from live bullion market. Enter custom numbers below as manual override:'}
                </p>

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
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span>{language === 'ne' ? 'नेप्से सेयर बजार' : 'NEPSE Stock Market'}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live Feed</span>
                    </span>
                  </div>
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

                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {language === 'ne'
                    ? 'प्रत्यक्ष कारोबार समयमा स्वतः अपडेट हुन्छ। वा म्यानुअल ओभरराइड गर्नुहोस्:'
                    : 'Auto-updates during live market sessions. Or enter custom override below:'}
                </p>

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
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-blue-500" />
                      <span>{language === 'ne' ? 'डलर विनिमय दर' : 'Forex Rate (USD)'}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live NRB/Exchange API</span>
                    </span>
                  </div>
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

                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {language === 'ne'
                    ? 'दैनिक अन्तर्राष्ट्रिय तथा नेपाल राष्ट्र बैंक विनिमय API बाट सिंक हुन्छ:'
                    : 'Auto-fetched from live global & Nepal Rastra Bank forex exchange API:'}
                </p>

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
                  <span>{language === 'ne' ? 'सूचना विभाग दर्ता नं.' : 'Dept. of Information Reg. No.'}</span>
                </label>
                <input
                  type="text"
                  value={settings.siteInfo.deptOfInfoNo || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      siteInfo: { ...settings.siteInfo, deptOfInfoNo: e.target.value },
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
                  {language === 'ne' ? 'सम्पादक' : 'Editor'}
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
                  {language === 'ne' ? 'सह-सम्पादक' : 'Co-Editor'}
                </label>
                <input
                  type="text"
                  value={settings.siteInfo.coEditorName || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      siteInfo: { ...settings.siteInfo, coEditorName: e.target.value },
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

        {/* TAB 5: TRENDING TOPICS INFINITE MARQUEE */}
        {activeTab === 'trending' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-8">
            {/* Header & Master Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{language === 'ne' ? 'चर्चामा रहेका विषयहरू (Trending Topics Ribbon)' : 'Trending Topics Infinite Ribbon'}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {language === 'ne'
                    ? 'गृहपृष्ठको शीर्ष नेभिगेसनमुनि निरन्तर चल्ने इन्फिनिट रिबनमा देखाइने विषयहरू र ह्यासट्यागहरू व्यवस्थापन गर्नुहोस्।'
                    : 'Manage continuous horizontal scrolling topics & hashtag pills displayed below the header navigation.'}
                </p>
              </div>

              {/* Master Switch */}
              <label className="flex items-center gap-3 cursor-pointer self-start sm:self-auto bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={settings.trendingTopics?.enabled ?? true}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      trendingTopics: {
                        ...settings.trendingTopics,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500 accent-red-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {language === 'ne' ? 'रिबन सक्रिय गर्नुहोस्' : 'Enable Ribbon'}
                </span>
              </label>
            </div>

            {/* Ribbon Titles (Nepali & English) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ne' ? 'रिबन पिन गरिएको शीर्षक (नेपाली)' : 'Pinned Badge Title (Nepali)'}
                </label>
                <input
                  type="text"
                  value={settings.trendingTopics?.titleNe || ''}
                  placeholder="चर्चामा"
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      trendingTopics: {
                        ...settings.trendingTopics,
                        titleNe: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ne' ? 'रिबन पिन गरिएको शीर्षक (English)' : 'Pinned Badge Title (English)'}
                </label>
                <input
                  type="text"
                  value={settings.trendingTopics?.titleEn || ''}
                  placeholder="Trending"
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      trendingTopics: {
                        ...settings.trendingTopics,
                        titleEn: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Quick Add Presets */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'ne' ? 'द्रुत विषयहरू थप्नुहोस् (Quick Add Presets):' : 'Click to Quick-Add Popular Topics:'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { ne: '#लुम्बिनी_महोत्सव', en: '#LumbiniExpo', hot: true },
                  { ne: '#नेपाली_क्रिकेट', en: '#NepalCricket', hot: true },
                  { ne: '#नेप्से_परिसूचक', en: '#NEPSE', hot: false },
                  { ne: '#आर्थिक_सुधार', en: '#EconomicReform', hot: false },
                  { ne: '#जलविद्युत्_निर्यात', en: '#Hydropower', hot: true },
                  { ne: '#मन्त्रिपरिषद्_निर्णय', en: '#CabinetDecision', hot: false },
                  { ne: '#पर्यटनवर्ष', en: '#VisitNepal', hot: false },
                ].map((preset) => {
                  const alreadyExists = (settings.trendingTopics?.items || []).some((i) => i.labelNe === preset.ne)
                  return (
                    <button
                      key={preset.ne}
                      type="button"
                      disabled={alreadyExists}
                      onClick={() => handleQuickAddPreset(preset.ne, preset.en, preset.hot)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition ${
                        alreadyExists
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-amber-500 hover:text-white border border-slate-300 dark:border-slate-700 shadow-2xs cursor-pointer'
                      }`}
                    >
                      <span>+</span>
                      <span>{language === 'ne' ? preset.ne : preset.en}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Add New Custom Topic Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-red-600" />
                <span>{language === 'ne' ? 'नयाँ विषय / ह्यासट्याग थप्नुहोस्' : 'Add New Trending Topic'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'ne' ? 'शीर्षक (नेपाली)' : 'Label (Nepali)'} *
                  </label>
                  <input
                    type="text"
                    placeholder="#प्रतिनिधिसभा"
                    value={newTopicNe}
                    onChange={(e) => setNewTopicNe(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'ne' ? 'शीर्षक (English)' : 'Label (English)'}
                  </label>
                  <input
                    type="text"
                    placeholder="#HouseOfReps"
                    value={newTopicEn}
                    onChange={(e) => setNewTopicEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'ne' ? 'लिङ्क (वैकल्पिक)' : 'Custom URL (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="/search?q=..."
                    value={newTopicUrl}
                    onChange={(e) => setNewTopicUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-amber-600">
                    <input
                      type="checkbox"
                      checked={newTopicIsHot}
                      onChange={(e) => setNewTopicIsHot(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400 accent-amber-500 cursor-pointer"
                    />
                    <span>🔥 {language === 'ne' ? 'हट' : 'Hot'}</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAddTopic}
                    disabled={!newTopicNe.trim()}
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'ne' ? 'थप्नुहोस्' : 'Add'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Current Topics List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {language === 'ne'
                    ? `हाल सक्रिय विषयहरू (${(settings.trendingTopics?.items || []).length})`
                    : `Active Topics List (${(settings.trendingTopics?.items || []).length})`}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {language === 'ne'
                    ? 'क्रम मिलाउन बाण चिन्ह (↑/↓) प्रयोग गर्नुहोस्'
                    : 'Use arrows to reorder pills'}
                </span>
              </div>

              {(settings.trendingTopics?.items || []).length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-xs">
                  {language === 'ne'
                    ? 'कुनै चर्चामा रहेका विषयहरू छैनन्। माथिका द्रुत बटन वा फारमबाट थप्नुहोस्।'
                    : 'No trending topics added yet. Click a quick-add preset above.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {(settings.trendingTopics?.items || []).map((topic, index) => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      {/* Left: Reorder Arrows & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Up/Down reorder */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveTopic(index, 'up')}
                            className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === (settings.trendingTopics?.items || []).length - 1}
                            onClick={() => handleMoveTopic(index, 'down')}
                            className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Pill Display */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition ${
                              topic.isActive
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-2xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-dashed border-slate-300 dark:border-slate-700 line-through opacity-70'
                            }`}
                          >
                            {topic.isHot && <Flame className="w-3 h-3 text-amber-500 fill-amber-500 animate-pulse" />}
                            <span>{topic.labelNe}</span>
                            {topic.labelEn && topic.labelEn !== topic.labelNe && (
                              <span className="text-[10px] text-slate-400 font-normal">({topic.labelEn})</span>
                            )}
                          </span>

                          <span className="text-[11px] text-slate-400 font-mono hidden md:inline truncate max-w-[200px]">
                            {topic.url || `→ Search /search?q=${topic.labelNe.replace(/^#/, '')}`}
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Hot Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleTopicHot(topic.id)}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            topic.isHot
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700'
                          }`}
                          title="Toggle 🔥 Hot badge"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[10px]">{topic.isHot ? 'HOT' : 'Normal'}</span>
                        </button>

                        {/* Active Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleTopicActive(topic.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                            topic.isActive
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {topic.isActive ? (language === 'ne' ? 'सक्रिय' : 'Active') : (language === 'ne' ? 'निष्क्रिय' : 'Off')}
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteTopic(topic.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                          title="Delete topic"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Interactive Preview Box */}
            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'ne' ? 'प्रत्यक्ष पूर्वावलोकन (Live Preview on Homepage):' : 'Live Front-End Preview:'}</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {language === 'ne' ? '(माउस लैजाँदा रोकिन्छ)' : '(Pauses on cursor hover)'}
                </span>
              </div>

              {/* Mini Ribbon Preview */}
              <div className="marquee-container relative w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs py-2 px-3 overflow-hidden flex items-center shadow-2xs">
                <div className="shrink-0 flex items-center gap-1.5 pr-2.5 bg-white dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-800">
                  <Flame className="w-3 h-3 text-red-600 fill-red-600 animate-pulse" />
                  <span className="font-black text-slate-900 dark:text-white text-[11px]">
                    {settings.trendingTopics?.titleNe || 'चर्चामा'}:
                  </span>
                </div>

                <div className="flex-1 overflow-hidden relative flex items-center pl-2">
                  <div className="animate-marquee-infinite flex items-center gap-2 shrink-0 py-0.5 pr-2">
                    {(settings.trendingTopics?.items || [])
                      .filter((i) => i.isActive)
                      .map((topic, i) => (
                        <span
                          key={`prev1-${topic.id}-${i}`}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs whitespace-nowrap"
                        >
                          {topic.isHot && <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />}
                          <span>{topic.labelNe}</span>
                        </span>
                      ))}
                  </div>
                  <div className="animate-marquee-infinite flex items-center gap-2 shrink-0 py-0.5 pr-2" aria-hidden="true">
                    {(settings.trendingTopics?.items || [])
                      .filter((i) => i.isActive)
                      .map((topic, i) => (
                        <span
                          key={`prev2-${topic.id}-${i}`}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs whitespace-nowrap"
                        >
                          {topic.isHot && <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />}
                          <span>{topic.labelNe}</span>
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: OUR TEAM MEMBERS (हाम्रो टिम) */}
        {activeTab === 'team' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-8">
            {/* Header & Master Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-600" />
                  <span>{language === 'ne' ? 'हाम्रो टिम व्यवस्थापन' : 'Our Team Members Management'}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'ne'
                    ? 'सम्पादक, सह-सम्पादक, सम्पादकीय मण्डल र प्राविधिक टोलीको विवरण व्यवस्थापन गर्नुहोस्'
                    : 'Manage editorial board, leadership, reporters, and multimedia team displayed on /our-team'}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'ne' ? 'टिम पृष्ठ सक्रिय:' : 'Team Page Active:'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.team?.enabled ?? true}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        team: {
                          ...(prev.team || DEFAULT_TEAM_SETTINGS),
                          enabled: e.target.checked,
                        },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>

            {/* Page Header Titles Configuration */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {language === 'ne' ? 'पृष्ठ शीर्षक तथा उपशीर्षक' : 'Page Header & Description'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    शीर्षक (नेपाली)
                  </label>
                  <input
                    type="text"
                    value={settings.team?.titleNe || ''}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        team: {
                          ...(prev.team || DEFAULT_TEAM_SETTINGS),
                          titleNe: e.target.value,
                        },
                      }))
                    }
                    placeholder="हाम्रो टिम"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    value={settings.team?.titleEn || ''}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        team: {
                          ...(prev.team || DEFAULT_TEAM_SETTINGS),
                          titleEn: e.target.value,
                        },
                      }))
                    }
                    placeholder="Our Team"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    उपशीर्षक / संक्षिप्त परिचय (नेपाली)
                  </label>
                  <input
                    type="text"
                    value={settings.team?.subtitleNe || ''}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        team: {
                          ...(prev.team || DEFAULT_TEAM_SETTINGS),
                          subtitleNe: e.target.value,
                        },
                      }))
                    }
                    placeholder="सबै छ डट कम (SabaiChha.com) को सम्पादकीय तथा सञ्चालक समूह"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Add New Team Member Form */}
            <div className="p-4 sm:p-5 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                <UserPlus className="w-4 h-4" />
                <span>{language === 'ne' ? 'नयाँ टिम सदस्य थप्नुहोस्' : 'Add New Team Member'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    नाम (नेपाली) *
                  </label>
                  <input
                    type="text"
                    value={newMemberNameNe}
                    onChange={(e) => setNewMemberNameNe(e.target.value)}
                    placeholder="उदा: जुनमायाँ पुन मगर"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Name (English)
                  </label>
                  <input
                    type="text"
                    value={newMemberNameEn}
                    onChange={(e) => setNewMemberNameEn(e.target.value)}
                    placeholder="e.g. Junmaya Pun Magar"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    पद / Designation (नेपाली) *
                  </label>
                  <input
                    type="text"
                    value={newMemberRoleNe}
                    onChange={(e) => setNewMemberRoleNe(e.target.value)}
                    placeholder="उदा: सम्पादक, सह-सम्पादक, संवाददाता"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Role (English)
                  </label>
                  <input
                    type="text"
                    value={newMemberRoleEn}
                    onChange={(e) => setNewMemberRoleEn(e.target.value)}
                    placeholder="e.g. Editor-in-Chief"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    शाखा / Department
                  </label>
                  <select
                    value={newMemberDept}
                    onChange={(e) => setNewMemberDept(e.target.value as TeamDepartment)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="LEADERSHIP">सम्पादकीय नेतृत्व (Leadership)</option>
                    <option value="EDITORIAL">सम्पादकीय डेस्क (Editorial)</option>
                    <option value="REPORTING">समाचार तथा रिपोर्टिङ (Reporting)</option>
                    <option value="MULTIMEDIA">मल्टिमिडिया तथा भिडियो (Multimedia)</option>
                    <option value="TECHNICAL">प्राविधिक तथा डिजिटल (Technical)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    फोटो URL (Avatar URL)
                  </label>
                  <input
                    type="text"
                    value={newMemberAvatarUrl}
                    onChange={(e) => setNewMemberAvatarUrl(e.target.value)}
                    placeholder="https://... वा /uploads/photo.jpg"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    सम्पर्क नम्बर (Phone)
                  </label>
                  <input
                    type="text"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    placeholder="उदा: 9860207171"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    इमेल (Email)
                  </label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="editor@sabaichha.com"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddMember}
                    disabled={!newMemberNameNe.trim() || !newMemberRoleNe.trim()}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm shadow-red-600/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>सदस्य थप्नुहोस्</span>
                  </button>
                </div>
              </div>
            </div>

            {/* List of Registered Members */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {language === 'ne' ? 'हाल दर्ता भएका टिम सदस्यहरू' : 'Registered Team Members'} (
                    {settings.team?.members?.length || 0})
                  </span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  क्रम मिलाउन माथि/तल बटन प्रयोग गर्नुहोस्
                </span>
              </div>

              {(!settings.team?.members || settings.team.members.length === 0) ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                  कुनै टिम सदस्य थपिएको छैन। माथिको फारमबाट नयाँ सदस्य थप्नुहोस्।
                </div>
              ) : (
                <div className="space-y-2.5">
                  {settings.team.members.map((member, index) => (
                    <div
                      key={member.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        member.isActive
                          ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/70'
                          : 'bg-slate-100/50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Order Number */}
                        <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-600">
                          {index + 1}
                        </span>

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden border border-slate-300 dark:border-slate-600">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.nameNe}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                              {member.nameNe.slice(0, 1)}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {member.nameNe}
                            </span>
                            {member.nameEn && member.nameEn !== member.nameNe && (
                              <span className="text-[11px] text-slate-400 font-sans truncate">
                                ({member.nameEn})
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                              {member.roleNe}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                            {member.phone && (
                              <span className="flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 text-emerald-500" />
                                {member.phone}
                              </span>
                            )}
                            {member.email && (
                              <span className="flex items-center gap-1 font-mono">
                                <Mail className="w-3 h-3 text-blue-500" />
                                {member.email}
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {member.department}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {/* Toggle Active */}
                        <button
                          type="button"
                          onClick={() => handleToggleMemberActive(member.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                            member.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {member.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                        </button>

                        {/* Move Up */}
                        <button
                          type="button"
                          onClick={() => handleMoveMember(index, 'up')}
                          disabled={index === 0}
                          title="माथि सार्नुहोस्"
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          onClick={() => handleMoveMember(index, 'down')}
                          disabled={index === (settings.team?.members.length || 0) - 1}
                          title="तल सार्नुहोस्"
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member.id)}
                          title="हटाउनुहोस्"
                          className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition cursor-pointer ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
