'use client'

import * as React from 'react'
import Image from 'next/image'
import { useLanguage } from '@/context/language-context'
import { toNepaliNumerals } from '@/lib/market/market-service'
import {
  ShieldAlert,
  Search,
  RefreshCw,
  FileDown,
  X,
  Filter,
  Calendar,
  User,
  Clock,
  Eye,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react'

interface AuditLogItem {
  id: string
  userId: string | null
  action: string
  targetType: string
  targetId: string | null
  details: string | null
  ipAddress: string | null
  createdAt: string
  user: {
    id: string
    fullName: string
    email: string
    role: string
    avatarUrl: string | null
  } | null
}

interface AuditResponse {
  logs: AuditLogItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: {
    totalAllLogs: number
    todayLogsCount: number
    filteredCount: number
  }
  filters: {
    availableActions: string[]
    availableTargets: string[]
  }
}

export default function AuditLogsPage() {
  const { language } = useLanguage()

  const [data, setData] = React.useState<AuditResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Filters & Pagination State
  const [page, setPage] = React.useState(1)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [actionFilter, setActionFilter] = React.useState('')
  const [targetTypeFilter, setTargetTypeFilter] = React.useState('')
  const [daysFilter, setDaysFilter] = React.useState('')

  // Detail Modal State
  const [selectedLog, setSelectedLog] = React.useState<AuditLogItem | null>(null)
  const [copiedId, setCopiedId] = React.useState(false)

  // Debounce search input by 300ms
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const fetchLogs = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (actionFilter) params.set('action', actionFilter)
      if (targetTypeFilter) params.set('targetType', targetTypeFilter)
      if (daysFilter) params.set('days', daysFilter)

      const res = await fetch(`/api/admin/audit?${params.toString()}`)
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error(
            language === 'ne'
              ? 'तपाईंलाई सुरक्षा अडिट लगहरू हेर्ने अनुमति छैन।'
              : 'You do not have permission to view audit logs.'
          )
        }
        throw new Error('Failed to load audit logs.')
      }

      const json: AuditResponse = await res.json()
      setData(json)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching audit logs')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, actionFilter, targetTypeFilter, daysFilter, language])

  React.useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleResetFilters = () => {
    setSearchTerm('')
    setDebouncedSearch('')
    setActionFilter('')
    setTargetTypeFilter('')
    setDaysFilter('')
    setPage(1)
  }

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleString(language === 'ne' ? 'ne-NP' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
      if (diff < 1) return language === 'ne' ? 'भर्खरै' : 'Just now'
      if (diff < 60) {
        return language === 'ne'
          ? `${toNepaliNumerals(diff)} मिनेट अगाडि`
          : `${diff}m ago`
      }
      const hours = Math.floor(diff / 60)
      if (hours < 24) {
        return language === 'ne'
          ? `${toNepaliNumerals(hours)} घण्टा अगाडि`
          : `${hours}h ago`
      }
      const days = Math.floor(hours / 24)
      return language === 'ne'
        ? `${toNepaliNumerals(days)} दिन अगाडि`
        : `${days}d ago`
    } catch {
      return ''
    }
  }

  const getActionBadgeColor = (action: string) => {
    const act = action.toUpperCase()
    if (act.includes('DELETE') || act.includes('REMOVE')) {
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900'
    }
    if (act.includes('CREATE') || act.includes('UPLOAD')) {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
    }
    if (act.includes('UPDATE') || act.includes('EDIT')) {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900'
    }
    if (act.includes('LOGIN') || act.includes('PASSWORD') || act.includes('AUTH')) {
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900'
    }
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
  }

  const exportToCSV = () => {
    if (!data || !data.logs || data.logs.length === 0) return

    const headers = ['Timestamp', 'Action', 'TargetType', 'TargetId', 'ActorName', 'ActorEmail', 'Role', 'IPAddress', 'Details']
    const rows = data.logs.map((l) => [
      `"${l.createdAt}"`,
      `"${l.action}"`,
      `"${l.targetType}"`,
      `"${l.targetId || ''}"`,
      `"${l.user?.fullName || 'System'}"`,
      `"${l.user?.email || 'N/A'}"`,
      `"${l.user?.role || 'N/A'}"`,
      `"${l.ipAddress || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyLogId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const isFiltered = Boolean(debouncedSearch || actionFilter || targetTypeFilter || daysFilter)

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. PAGE HEADER */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            <span>
              {language === 'ne' ? 'सुरक्षा अडिट लगहरू' : 'Security Audit Logs'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'ne'
              ? 'प्रणाली भित्र भएका सबै सम्पादकीय, प्रशासनिक तथा सुरक्षा सम्बन्धी गतिविधिहरूको विस्तृत अनुगमन।'
              : 'Inspect all editorial, administrative, and security activity logs across the platform.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{language === 'ne' ? 'ताजा गर्नुहोस्' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={exportToCSV}
            disabled={!data || data.logs.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{language === 'ne' ? 'CSV डाउनलोड' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. STATS SUMMARY CARDS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Audit Events */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ne' ? 'कुल अडिट गतिविधिहरू' : 'Total Audit Events'}
            </span>
            <div className="text-2xl font-black text-slate-950 dark:text-white font-mono">
              {data
                ? language === 'ne'
                  ? toNepaliNumerals(data.stats.totalAllLogs)
                  : data.stats.totalAllLogs
                : '—'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-900/50">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Events */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ne' ? 'आजका गतिविधिहरू' : "Today's Events"}
            </span>
            <div className="text-2xl font-black text-slate-950 dark:text-white font-mono">
              {data
                ? language === 'ne'
                  ? toNepaliNumerals(data.stats.todayLogsCount)
                  : data.stats.todayLogsCount
                : '—'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900/50">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Filtered Count */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ne' ? 'हाल देखिएका लगहरू' : 'Filtered Results'}
            </span>
            <div className="text-2xl font-black text-slate-950 dark:text-white font-mono">
              {data
                ? language === 'ne'
                  ? toNepaliNumerals(data.pagination.total)
                  : data.pagination.total
                : '—'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/50">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. FILTERS & SEARCH TOOLBAR */}
      {/* ======================================================== */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                language === 'ne'
                  ? 'कर्मचारी, कार्य वा विवरण खोज्नुहोस्...'
                  : 'Search by actor, action, details...'
              }
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Target Type Filter */}
          <div>
            <select
              value={targetTypeFilter}
              onChange={(e) => {
                setTargetTypeFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              <option value="">
                {language === 'ne'
                  ? 'सबै लक्षित प्रकार (All Target Types)'
                  : 'All Target Types'}
              </option>
              {data?.filters?.availableTargets?.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              <option value="">
                {language === 'ne'
                  ? 'सबै गतिविधिहरू (All Actions)'
                  : 'All Actions'}
              </option>
              {data?.filters?.availableActions?.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Filter */}
          <div>
            <select
              value={daysFilter}
              onChange={(e) => {
                setDaysFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              <option value="">
                {language === 'ne' ? 'सबै समय (All Time)' : 'All Time'}
              </option>
              <option value="today">
                {language === 'ne' ? 'आज मात्र (Today Only)' : 'Today Only'}
              </option>
              <option value="7">
                {language === 'ne'
                  ? 'पछिल्लो ७ दिन (Last 7 Days)'
                  : 'Last 7 Days'}
              </option>
              <option value="30">
                {language === 'ne'
                  ? 'पछिल्लो ३० दिन (Last 30 Days)'
                  : 'Last 30 Days'}
              </option>
            </select>
          </div>
        </div>

        {/* Filter Badges & Reset */}
        {isFiltered && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 text-[11px] font-medium">
              {language === 'ne'
                ? `फिल्टर गरिएको: ${data?.pagination.total || 0} वटा नतिजा`
                : `Filtered results: ${data?.pagination.total || 0} logs`}
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-red-600 hover:text-red-700 dark:text-red-400 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>{language === 'ne' ? 'फिल्टर हटाउनुहोस्' : 'Clear Filters'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. AUDIT LOGS TABLE */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3.5">{language === 'ne' ? 'समय' : 'Timestamp'}</th>
                <th className="px-4 py-3.5">{language === 'ne' ? 'कर्मचारी (Actor)' : 'User / Actor'}</th>
                <th className="px-4 py-3.5">{language === 'ne' ? 'कार्य (Action)' : 'Action'}</th>
                <th className="px-4 py-3.5">{language === 'ne' ? 'लक्षित विषय' : 'Target'}</th>
                <th className="px-4 py-3.5">{language === 'ne' ? 'आईपी' : 'IP'}</th>
                <th className="px-4 py-3.5">{language === 'ne' ? 'विवरण' : 'Details'}</th>
                <th className="px-4 py-3.5 text-right">{language === 'ne' ? 'कार्य' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    <span>Loading audit records...</span>
                  </td>
                </tr>
              ) : !data || data.logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    <span>
                      {language === 'ne'
                        ? 'कुनै अडिट लग भेटिएन।'
                        : 'No audit records found matching your filters.'}
                    </span>
                  </td>
                </tr>
              ) : (
                data.logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer"
                  >
                    {/* Timestamp */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-[11px]">
                        {formatDateTime(log.createdAt)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {formatTimeAgo(log.createdAt)}
                      </div>
                    </td>

                    {/* Actor / User */}
                    <td className="px-4 py-3.5">
                      {log.user ? (
                        <div className="flex items-center gap-2.5">
                          {log.user.avatarUrl ? (
                            <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                              <Image
                                src={log.user.avatarUrl}
                                alt={log.user.fullName}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 text-xs font-bold">
                              {log.user.fullName.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white truncate">
                              {log.user.fullName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              {log.user.role}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          System / Anonymous
                        </span>
                      )}
                    </td>

                    {/* Action Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    {/* Target */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold border border-slate-200 dark:border-slate-700">
                        {log.targetType}
                      </span>
                      {log.targetId && (
                        <span className="text-[10px] text-slate-400 font-mono block mt-1 truncate max-w-[120px]">
                          #{log.targetId.slice(0, 8)}...
                        </span>
                      )}
                    </td>

                    {/* IP Address */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {log.ipAddress || '—'}
                    </td>

                    {/* Details Snippet */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <p className="text-slate-700 dark:text-slate-300 line-clamp-1 text-[11px]">
                        {log.details || '—'}
                      </p>
                    </td>

                    {/* Action Button */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedLog(log)
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {data && data.pagination.totalPages > 1 && (
          <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              {language === 'ne'
                ? `पृष्ठ ${toNepaliNumerals(data.pagination.page)} / ${toNepaliNumerals(data.pagination.totalPages)} (जम्मा ${toNepaliNumerals(data.pagination.total)} लगहरू)`
                : `Page ${data.pagination.page} of ${data.pagination.totalPages} (${data.pagination.total} total logs)`}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page >= data.pagination.totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 5. AUDIT LOG DETAIL MODAL */}
      {/* ======================================================== */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    {language === 'ne'
                      ? 'अडिट लग पूर्ण विवरण'
                      : 'Audit Log Details'}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {selectedLog.id}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Action & Target */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'ne' ? 'कार्य (Action)' : 'Action'}
                  </span>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${getActionBadgeColor(
                      selectedLog.action
                    )}`}
                  >
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'ne' ? 'लक्षित प्रकार' : 'Target Type'}
                  </span>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-semibold">
                    {selectedLog.targetType}
                  </span>
                </div>
              </div>

              {/* Timestamp & IP */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'ne' ? 'मिति तथा समय' : 'Timestamp'}
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold block mt-0.5">
                    {formatDateTime(selectedLog.createdAt)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatTimeAgo(selectedLog.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'ne' ? 'ग्राहक आईपी' : 'Client IP'}
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold block mt-0.5">
                    {selectedLog.ipAddress || '—'}
                  </span>
                </div>
              </div>

              {/* Actor */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {language === 'ne' ? 'कार्यकर्ता कर्मचारी' : 'Actor / Staff Member'}
                </span>
                {selectedLog.user ? (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        {selectedLog.user.fullName}
                      </h4>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {selectedLog.user.email}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900">
                      {selectedLog.user.role}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-500 italic">System / Anonymous</span>
                )}
              </div>

              {/* Target ID */}
              {selectedLog.targetId && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Target Record ID
                  </span>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    <span className="flex-1 truncate">{selectedLog.targetId}</span>
                    <button
                      type="button"
                      onClick={() => copyLogId(selectedLog.targetId!)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {copiedId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Detailed Payload / Message */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {language === 'ne' ? 'विस्तृत विवरण' : 'Activity Details'}
                </span>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700">
                  {selectedLog.details || 'No additional details recorded.'}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                {language === 'ne' ? 'बन्द गर्नुहोस्' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
