'use client'

import * as React from 'react'
import {
  Mail,
  Download,
  Trash2,
  CheckCircle2,
  Search,
  Calendar,
  Users,
} from 'lucide-react'

interface Subscriber {
  id: string
  email: string
  isActive: boolean
  createdAt: string
}

export function NewsletterManager() {
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([])
  const [totalCount, setTotalCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')

  const fetchSubscribers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/newsletter')
      const data = await res.json()
      if (res.ok) {
        setSubscribers(data.subscribers || [])
        setTotalCount(data.totalCount || 0)
      }
    } catch (err) {
      console.error('Failed to load subscribers:', err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchSubscribers()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return

    try {
      const res = await fetch(`/api/admin/newsletter?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchSubscribers()
      }
    } catch (err) {
      console.error('Delete subscriber error:', err)
    }
  }

  const exportCSV = () => {
    if (subscribers.length === 0) return
    const headers = ['Email,Date Subscribed,Status\n']
    const rows = subscribers.map(
      (s) => `"${s.email}","${new Date(s.createdAt).toLocaleDateString()}","${s.isActive ? 'Active' : 'Inactive'}"\n`
    )
    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sabaichha_newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-red-600" />
            <span>इमेल बुलेटिन ग्राहकहरू (Newsletter Subscribers)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            वेबसाइटबाट दैनिक बिहानी समाचार बुलेटिनका लागि दर्ता भएका पाठकहरूको सूची तथा CSV निर्यात।
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          disabled={subscribers.length === 0}
          className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-2 shadow cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>CSV निर्यात गर्नुहोस् (Export CSV)</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>कुल ग्राहक (Total Subscribers)</span>
            <Users className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {totalCount.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>सक्रिय स्थिति (Active Rate)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            100%
          </p>
        </div>
      </div>

      {/* Search & List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscribers by email..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <span className="text-xs font-mono text-slate-400">
            {filtered.length} subscribers
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading subscribers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <Mail className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="font-bold text-slate-700 dark:text-slate-300">कुनै ग्राहक भेटिएन</p>
            <p>वेबसाइटको मुख्य पृष्ठ वा फुटरबाट पाठकहरूले दर्ता गरेपछि यहाँ देखिनेछ।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">इमेल ठेगाना (Email Address)</th>
                  <th className="py-3 px-4">दर्ता मिति (Subscribed At)</th>
                  <th className="py-3 px-4 text-center">स्थिति (Status)</th>
                  <th className="py-3 px-4 text-right">कार्य (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {sub.email}
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {new Date(sub.createdAt).toLocaleDateString('ne-NP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Active
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(sub.id)}
                        className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 transition cursor-pointer"
                        title="हटाउनुहोस् (Remove)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
