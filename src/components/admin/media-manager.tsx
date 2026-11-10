'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  Image as ImageIcon,
  FileImage,
  RefreshCw,
  ExternalLink,
  Edit2,
  Save,
  X,
  AlertCircle,
} from 'lucide-react'

export interface MediaItem {
  id: string
  fileName: string
  fileUrl: string
  mimeType: string
  fileSize: number
  altText: string | null
  createdAt: string | Date
  uploader?: {
    id: string
    fullName: string
    email: string
  }
}

export function MediaManager({
  initialMedia = [],
  initialTotal = 0,
}: {
  initialMedia?: MediaItem[]
  initialTotal?: number
}) {
  const [media, setMedia] = React.useState<MediaItem[]>(initialMedia)
  const [total, setTotal] = React.useState<number>(initialTotal)
  const [search, setSearch] = React.useState('')
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [selectedItem, setSelectedItem] = React.useState<MediaItem | null>(null)
  const [editingAlt, setEditingAlt] = React.useState('')
  const [isSavingAlt, setIsSavingAlt] = React.useState(false)
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  // Fetch / Search Media
  const fetchMedia = async (query = search) => {
    try {
      const res = await fetch(`/api/admin/media?q=${encodeURIComponent(query)}&limit=48`)
      if (res.ok) {
        const data = await res.json()
        setMedia(data.media)
        setTotal(data.pagination.total)
      }
    } catch (err) {
      console.error('Failed to fetch media:', err)
    }
  }

  // Handle Search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    fetchMedia(val)
  }

  // File Upload
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setIsUploading(true)
    setUploadError(null)

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }

    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload files.')
      }

      await fetchMedia('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed.')
    } finally {
      setIsUploading(false)
    }
  }

  // Copy URL to Clipboard
  const handleCopyUrl = (item: MediaItem) => {
    const fullUrl = item.fileUrl.startsWith('http')
      ? item.fileUrl
      : `${window.location.origin}${item.fileUrl}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Delete media item
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this media file?')) return
    setIsDeletingId(id)

    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMedia((prev) => prev.filter((m) => m.id !== id))
        setTotal((prev) => Math.max(0, prev - 1))
        if (selectedItem?.id === id) setSelectedItem(null)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete file.')
      }
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setIsDeletingId(null)
    }
  }

  // Save Alt Text
  const handleSaveAlt = async () => {
    if (!selectedItem) return
    setIsSavingAlt(true)

    try {
      const res = await fetch(`/api/admin/media/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ altText: editingAlt }),
      })

      if (res.ok) {
        const data = await res.json()
        setMedia((prev) =>
          prev.map((m) => (m.id === selectedItem.id ? { ...m, altText: data.media.altText } : m))
        )
        setSelectedItem((prev) => (prev ? { ...prev, altText: data.media.altText } : null))
      }
    } catch (err) {
      console.error('Save alt error:', err)
    } finally {
      setIsSavingAlt(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-red-600" />
            <span>मिडिया लाइब्रेरी (Media Library)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            समाचार र पृष्ठहरूका लागि फोटो तथा मिडिया व्यवस्थापन गर्नुहोस् ({total} files total)
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs hover:shadow-sm transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          {isUploading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>फोटो अपलोड गर्नुहोस् (Upload Images)</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* 2. Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
        className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-center hover:border-red-500 transition group cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            यहाँ फोटो वा भिडियो तानेर छाड्नुहोस् वा क्लिक गरेर छान्नुहोस्
          </p>
          <p className="text-xs text-slate-400">
            JPG, PNG, WebP, GIF, SVG, MP4, WebM (अधिकतम १० MB प्रति फाइल)
          </p>
        </div>
      </div>

      {uploadError && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* 3. Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="नाम वा विवरणबाट खोज्नुहोस् (Search by name or alt text)..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <button
          type="button"
          onClick={() => fetchMedia(search)}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
          title="Refresh library"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Media Grid */}
      {media.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <FileImage className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            कुनै फोटो भेटिएन (No media found)
          </p>
          <p className="text-xs text-slate-400">
            माथिको अपलोड बटन प्रयोग गरेर नयाँ फोटो थप्नुहोस्
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className={`group relative rounded-2xl overflow-hidden border bg-white dark:bg-slate-900 transition flex flex-col justify-between shadow-2xs hover:shadow-md cursor-pointer ${
                selectedItem?.id === item.id
                  ? 'border-red-600 ring-2 ring-red-600/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
              onClick={() => {
                setSelectedItem(item)
                setEditingAlt(item.altText || '')
              }}
            >
              {/* Image / Video Thumbnail */}
              <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {item.fileUrl.endsWith('.mp4') || item.fileUrl.endsWith('.webm') ? (
                  <div className="relative w-full h-full">
                    <video
                      src={item.fileUrl}
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/75 text-white">
                      VIDEO
                    </span>
                  </div>
                ) : (
                  <Image
                    src={item.fileUrl}
                    alt={item.altText || item.fileName}
                    fill
                    unoptimized={item.fileUrl.endsWith('.gif') || item.fileUrl.endsWith('.svg')}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                )}
              </div>

              {/* Card Footer */}
              <div className="p-2.5 space-y-1">
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate" title={item.fileName}>
                  {item.fileName}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{formatFileSize(item.fileSize)}</span>
                  <span>{item.mimeType.split('/')[1]?.toUpperCase()}</span>
                </div>
              </div>

              {/* Hover Action Overlay */}
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopyUrl(item)
                  }}
                  className="p-1.5 rounded-lg bg-black/75 hover:bg-black text-white backdrop-blur-xs transition"
                  title="Copy direct link"
                >
                  {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item.id)
                  }}
                  disabled={isDeletingId === item.id}
                  className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-700 text-white backdrop-blur-xs transition"
                  title="Delete media"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Detail Modal / Drawer for Selected Image */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                {selectedItem.fileName}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              {/* Image / Video Preview */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                {selectedItem.fileUrl.endsWith('.mp4') || selectedItem.fileUrl.endsWith('.webm') ? (
                  <video
                    src={selectedItem.fileUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={selectedItem.fileUrl}
                    alt={selectedItem.altText || selectedItem.fileName}
                    fill
                    unoptimized={selectedItem.fileUrl.endsWith('.gif') || selectedItem.fileUrl.endsWith('.svg')}
                    className="object-contain"
                  />
                )}
              </div>

              {/* Metadata & Controls */}
              <div className="space-y-4 text-xs">
                <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                  <p>
                    <span className="font-bold">File Size:</span> {formatFileSize(selectedItem.fileSize)}
                  </p>
                  <p>
                    <span className="font-bold">Type:</span> {selectedItem.mimeType}
                  </p>
                  <p>
                    <span className="font-bold">Uploaded By:</span> {selectedItem.uploader?.fullName || 'Staff'}
                  </p>
                  <p>
                    <span className="font-bold">Date:</span>{' '}
                    {new Date(selectedItem.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Alt Text Input */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    फोटो विवरण (Alt Text):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingAlt}
                      onChange={(e) => setEditingAlt(e.target.value)}
                      placeholder="वर्णन वा क्याप्सन लेख्नुहोस्..."
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                    <button
                      type="button"
                      onClick={handleSaveAlt}
                      disabled={isSavingAlt}
                      className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 transition flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingAlt ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(selectedItem)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-xs"
                  >
                    {copiedId === selectedItem.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === selectedItem.id ? 'लिंक कपी भयो!' : 'लिंक कपी (Copy Link)'}</span>
                  </button>

                  <a
                    href={selectedItem.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                    title="Open original"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDelete(selectedItem.id)}
                    className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
