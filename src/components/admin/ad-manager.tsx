'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  Megaphone,
  Plus,
  Eye,
  MousePointerClick,
  Percent,
  CheckCircle2,
  PauseCircle,
  Clock,
  Trash2,
  Edit2,
  ExternalLink,
  Search,
  Filter,
  X,
  Save,
  Image as ImageIcon,
  Code2,
} from 'lucide-react'
import { MediaPickerModal } from './media-picker-modal'

interface AdItem {
  id: string
  title: string
  placement: string
  type: string
  status: string
  imageUrl?: string | null
  targetUrl?: string | null
  scriptCode?: string | null
  sponsorName?: string | null
  impressions: number
  clicks: number
  startDate: string
  endDate?: string | null
  createdAt: string
}

interface AdStats {
  totalAds: number
  activeAds: number
  totalImpressions: number
  totalClicks: number
  ctr: string
}

const PLACEMENTS = [
  { key: 'HEADER_LEADERBOARD', label: 'Header Leaderboard', size: '728 × 90' },
  { key: 'HOMEPAGE_BILLBOARD', label: 'Homepage Billboard', size: '970 × 250' },
  { key: 'SIDEBAR_RECTANGLE', label: 'Sidebar Rectangle', size: '300 × 250' },
  { key: 'ARTICLE_INLINE', label: 'Article Inline', size: '728 × 90' },
  { key: 'STICKY_FOOTER', label: 'Sticky Footer Bar', size: 'Responsive' },
]

export function AdManager() {
  const [ads, setAds] = React.useState<AdItem[]>([])
  const [stats, setStats] = React.useState<AdStats>({
    totalAds: 0,
    activeAds: 0,
    totalImpressions: 0,
    totalClicks: 0,
    ctr: '0.00',
  })
  const [loading, setLoading] = React.useState(true)
  const [filterPlacement, setFilterPlacement] = React.useState('ALL')
  const [filterStatus, setFilterStatus] = React.useState('ALL')
  const [search, setSearch] = React.useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingAd, setEditingAd] = React.useState<AdItem | null>(null)
  const [isMediaPickerOpen, setIsMediaPickerOpen] = React.useState(false)

  // Form State
  const [title, setTitle] = React.useState('')
  const [sponsorName, setSponsorName] = React.useState('')
  const [placement, setPlacement] = React.useState('HEADER_LEADERBOARD')
  const [type, setType] = React.useState<'IMAGE_BANNER' | 'GOOGLE_ADSENSE' | 'CUSTOM_HTML'>('IMAGE_BANNER')
  const [status, setStatus] = React.useState<'ACTIVE' | 'PAUSED'>('ACTIVE')
  const [imageUrl, setImageUrl] = React.useState('')
  const [targetUrl, setTargetUrl] = React.useState('')
  const [scriptCode, setScriptCode] = React.useState('')
  const [startDate, setStartDate] = React.useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = React.useState('')
  const [saving, setSaving] = React.useState(false)

  const fetchAds = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterPlacement !== 'ALL') params.set('placement', filterPlacement)
      if (filterStatus !== 'ALL') params.set('status', filterStatus)
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`/api/admin/ads?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setAds(data.ads || [])
        setStats(data.stats || stats)
      }
    } catch (err) {
      console.error('Failed to load ads:', err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchAds()
  }, [filterPlacement, filterStatus])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchAds()
  }

  const openCreateModal = () => {
    setEditingAd(null)
    setTitle('')
    setSponsorName('')
    setPlacement('HEADER_LEADERBOARD')
    setType('IMAGE_BANNER')
    setStatus('ACTIVE')
    setImageUrl('')
    setTargetUrl('')
    setScriptCode('')
    setStartDate(new Date().toISOString().split('T')[0])
    setEndDate('')
    setIsModalOpen(true)
  }

  const openEditModal = (ad: AdItem) => {
    setEditingAd(ad)
    setTitle(ad.title)
    setSponsorName(ad.sponsorName || '')
    setPlacement(ad.placement)
    setType(ad.type as any)
    setStatus(ad.status as any)
    setImageUrl(ad.imageUrl || '')
    setTargetUrl(ad.targetUrl || '')
    setScriptCode(ad.scriptCode || '')
    setStartDate(ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '')
    setEndDate(ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : '')
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        title,
        sponsorName,
        placement,
        type,
        status,
        imageUrl,
        targetUrl,
        scriptCode,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      }

      const url = editingAd ? `/api/admin/ads/${editingAd.id}` : '/api/admin/ads'
      const method = editingAd ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setIsModalOpen(false)
        fetchAds()
      } else {
        alert('Failed to save advertisement.')
      }
    } catch {
      alert('Error saving advertisement.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return

    try {
      const res = await fetch(`/api/admin/ads/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchAds()
      }
    } catch (err) {
      console.error('Delete ad error:', err)
    }
  }

  const toggleStatus = async (ad: AdItem) => {
    const nextStatus = ad.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    try {
      await fetch(`/api/admin/ads/${ad.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      fetchAds()
    } catch (err) {
      console.error('Status toggle error:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-red-600" />
            <span>विज्ञापन व्यवस्थापन (Ad Management & Monetization)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            वेबसाइटका प्रमुख ब्यानर स्लटहरू, प्रायोजक विज्ञापन, गुगल एडसेन्स तथा CTR क्लिक ट्र्याकिङ।
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>नयाँ विज्ञापन थप्नुहोस् (Create Ad)</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>कुल प्रदर्शन (Impressions)</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {stats.totalImpressions.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>कुल क्लिक (Clicks)</span>
            <MousePointerClick className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {stats.totalClicks.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>क्लिक दर (CTR %)</span>
            <Percent className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {stats.ctr}%
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>सक्रिय अभियान (Active Ads)</span>
            <CheckCircle2 className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-600 dark:text-red-400 font-mono">
            {stats.activeAds} / {stats.totalAds}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or sponsor..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={filterPlacement}
            onChange={(e) => setFilterPlacement(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="ALL">All Placements (सबै स्लटहरू)</option>
            {PLACEMENTS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label} ({p.size})
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active (सक्रिय)</option>
            <option value="PAUSED">Paused (रोकिएको)</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Ads Table / List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading advertisements...</div>
        ) : ads.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <Megaphone className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="font-bold text-slate-700 dark:text-slate-300">कुनै विज्ञापन भेटिएन</p>
            <p>नयाँ विज्ञापन सिर्जना गर्न माथिको बटन थिच्नुहोस्।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">विज्ञापन विवरण (Creative)</th>
                  <th className="py-3 px-4">स्लट (Placement)</th>
                  <th className="py-3 px-4">प्रायोजक (Sponsor)</th>
                  <th className="py-3 px-4 text-center">प्रदर्शन (Views)</th>
                  <th className="py-3 px-4 text-center">क्लिक (Clicks)</th>
                  <th className="py-3 px-4 text-center">CTR %</th>
                  <th className="py-3 px-4 text-center">स्थिति (Status)</th>
                  <th className="py-3 px-4 text-right">कार्य (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {ads.map((ad) => {
                  const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00'
                  return (
                    <tr key={ad.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {ad.imageUrl ? (
                            <div className="relative w-16 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100">
                              <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-16 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                              <Code2 className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0 max-w-xs">
                            <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {ad.title}
                            </span>
                            {ad.targetUrl && (
                              <a
                                href={ad.targetUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-mono truncate"
                              >
                                <span>{ad.targetUrl}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {ad.placement.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {ad.sponsorName || '—'}
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                        {ad.impressions.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {ad.clicks.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                        {ctr}%
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleStatus(ad)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer flex items-center gap-1 mx-auto ${
                            ad.status === 'ACTIVE'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                          }`}
                        >
                          {ad.status === 'ACTIVE' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <PauseCircle className="w-3 h-3 text-amber-600" />
                              <span>Paused</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(ad)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                            title="सम्पादन गर्नुहोस् (Edit)"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(ad.id)}
                            className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 transition"
                            title="हटाउनुहोस् (Delete)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create or Edit Advertisement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-red-600" />
                <span>
                  {editingAd ? 'विज्ञापन सम्पादन (Edit Advertisement)' : 'नयाँ विज्ञापन सिर्जना (Create New Ad)'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Title & Sponsor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    अभियान शीर्षक (Campaign Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. नेपाल टेलिकम 5G नयाँ अफर"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    प्रायोजक / कम्पनी (Sponsor Name)
                  </label>
                  <input
                    type="text"
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    placeholder="e.g. Nepal Telecom / Ncell"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Placement & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    विज्ञापन स्लट (Placement Slot) *
                  </label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {PLACEMENTS.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label} ({p.size})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    विज्ञापन प्रकार (Ad Type) *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="IMAGE_BANNER">ब्यानर तस्बिर + लिङ्क (Image Banner)</option>
                    <option value="GOOGLE_ADSENSE">Google AdSense / Custom Script</option>
                    <option value="CUSTOM_HTML">Custom HTML Widget</option>
                  </select>
                </div>
              </div>

              {/* Image banner fields */}
              {type === 'IMAGE_BANNER' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      ब्यानर तस्बिर URL (Banner Image)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://... or choose from Media Library"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold shrink-0 flex items-center gap-1.5"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>मिडिया</span>
                      </button>
                    </div>

                    {imageUrl && (
                      <div className="mt-2 relative w-full h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100">
                        <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      गन्तव्य वेबसाइट लिङ्क (Target URL / Click Destination)
                    </label>
                    <input
                      type="url"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="https://client-website.com/promotion"
                      className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </>
              )}

              {/* Script code for AdSense */}
              {(type === 'GOOGLE_ADSENSE' || type === 'CUSTOM_HTML') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Google AdSense Code / Custom Script *
                  </label>
                  <textarea
                    rows={4}
                    value={scriptCode}
                    onChange={(e) => setScriptCode(e.target.value)}
                    placeholder="<script async src='https://pagead2.googlesyndication.com...'></script>"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              {/* Start & End Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    सुरु मिति (Start Date)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    समाप्ति मिति (End Date - Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  प्रकाशन स्थिति (Status)
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={status === 'ACTIVE'}
                      onChange={() => setStatus('ACTIVE')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span>Active (सक्रिय)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={status === 'PAUSED'}
                      onChange={() => setStatus('PAUSED')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span>Paused (रोकिएको)</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  रद्द (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'सुरक्षित गर्दै...' : 'सुरक्षित गर्नुहोस् (Save Ad)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          setImageUrl(url)
          setIsMediaPickerOpen(false)
        }}
      />
    </div>
  )
}
