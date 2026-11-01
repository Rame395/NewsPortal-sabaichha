'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  X,
  Search,
  Upload,
  Check,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react'
import { MediaItem } from './media-manager'

interface MediaPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (imageUrl: string, altText?: string) => void
}

export function MediaPickerModal({ isOpen, onClose, onSelect }: MediaPickerModalProps) {
  const [media, setMedia] = React.useState<MediaItem[]>([])
  const [search, setSearch] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<MediaItem | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const loadMedia = React.useCallback(async (q = '') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/media?q=${encodeURIComponent(q)}&limit=36`)
      if (res.ok) {
        const data = await res.json()
        setMedia(data.media)
      }
    } catch (err) {
      console.error('Failed to load media:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (isOpen) {
      loadMedia(search)
      setSelectedItem(null)
    }
  }, [isOpen, loadMedia, search])

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', files[0])

    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        await loadMedia('')
        if (data.media) {
          setSelectedItem(data.media)
        }
      }
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-red-600" />
              <span>मिडिया छान्नुहोस् (Select from Media Library)</span>
            </h3>
            <p className="text-xs text-slate-400">
              फोटो छान्नुहोस् वा नयाँ फोटो अपलोड गर्नुहोस्
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>अपलोड (Upload)</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                loadMedia(e.target.value)
              }}
              placeholder="फोटो खोज्नुहोस्..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
              <span>मिडिया लोड हुँदैछ...</span>
            </div>
          ) : media.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              कुनै फोटो भेटिएन। नयाँ फोटो अपलोड गर्नुहोस्।
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {media.map((item) => {
                const isSelected = selectedItem?.id === item.id
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`group relative rounded-xl overflow-hidden border bg-slate-100 dark:bg-slate-800 aspect-square cursor-pointer transition shadow-2xs hover:shadow-md ${
                      isSelected
                        ? 'border-red-600 ring-2 ring-red-600'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Image
                      src={item.fileUrl}
                      alt={item.altText || item.fileName}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />

                    {isSelected && (
                      <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center backdrop-blur-2xs">
                        <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <p className="text-xs text-slate-500 truncate max-w-sm">
            {selectedItem ? (
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                छानिएको: {selectedItem.fileName}
              </span>
            ) : (
              'कृपया एउटा फोटो छान्नुहोस्'
            )}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              रद्द गर्नुहोस् (Cancel)
            </button>
            <button
              type="button"
              disabled={!selectedItem}
              onClick={() => {
                if (selectedItem) {
                  onSelect(selectedItem.fileUrl, selectedItem.altText || undefined)
                  onClose()
                }
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              फोटो राख्नुहोस् (Insert Image)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
