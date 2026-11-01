'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/language-context'
import {
  FileText,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Flame,
  Star,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ListPlus,
  Quote,
  Heading1,
  Heading2,
  Bold,
  Italic,
  ExternalLink,
} from 'lucide-react'
import { MediaPickerModal } from '@/components/admin/media-picker-modal'

interface CategoryOption {
  id: number
  nameEn: string
  nameNe: string
}

interface TagOption {
  id: number
  name: string
  slug: string
}

interface InitialArticleData {
  id?: string
  title: string
  slug: string
  subtitle?: string | null
  content: string
  excerpt?: string | null
  featuredImage?: string | null
  imageCaption?: string | null
  categoryId: number
  status: 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'
  isBreaking: boolean
  isFeatured: boolean
  scheduledFor?: string | null
  tags?: { tag: { id: number; name: string } }[]
}

export function ArticleForm({
  initialData,
}: {
  initialData?: InitialArticleData
}) {
  const router = useRouter()
  const { language } = useLanguage()

  const [title, setTitle] = React.useState(initialData?.title || '')
  const [slug, setSlug] = React.useState(initialData?.slug || '')
  const [subtitle, setSubtitle] = React.useState(initialData?.subtitle || '')
  const [content, setContent] = React.useState(initialData?.content || '')
  const [excerpt, setExcerpt] = React.useState(initialData?.excerpt || '')
  const [featuredImage, setFeaturedImage] = React.useState(initialData?.featuredImage || '')
  const [imageCaption, setImageCaption] = React.useState(initialData?.imageCaption || '')
  const [categoryId, setCategoryId] = React.useState<number | ''>(initialData?.categoryId || '')
  const [status, setStatus] = React.useState(initialData?.status || 'DRAFT')
  const [isBreaking, setIsBreaking] = React.useState(initialData?.isBreaking || false)
  const [isFeatured, setIsFeatured] = React.useState(initialData?.isFeatured || false)
  const [scheduledFor, setScheduledFor] = React.useState(
    initialData?.scheduledFor ? new Date(initialData.scheduledFor).toISOString().slice(0, 16) : ''
  )

  const [categories, setCategories] = React.useState<CategoryOption[]>([])
  const [availableTags, setAvailableTags] = React.useState<TagOption[]>([])
  const [selectedTagIds, setSelectedTagIds] = React.useState<number[]>(
    initialData?.tags?.map((t) => t.tag.id) || []
  )
  const [tagInput, setTagInput] = React.useState('')

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)
  const [isMediaPickerOpen, setIsMediaPickerOpen] = React.useState(false)

  // Fetch categories and tags
  React.useEffect(() => {
    async function loadMeta() {
      try {
        const [cRes, tRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/tags'),
        ])
        const cData = await cRes.json()
        const tData = await tRes.json()

        if (cRes.ok && cData.categories) {
          setCategories(cData.categories)
          if (!initialData?.categoryId && cData.categories.length > 0) {
            setCategoryId(cData.categories[0].id)
          }
        }
        if (tRes.ok && tData.tags) {
          setAvailableTags(tData.tags)
        }
      } catch {
        console.error('Failed to load categories/tags')
      }
    }
    loadMeta()
  }, [initialData])

  // Auto-generate slug on title change
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!initialData) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\u0900-\u097F]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setSlug(generated)
    }
  }

  // Word count & read time
  const wordCount = content.split(/\s+/).filter(Boolean).length
  const readTime = Math.max(1, Math.ceil(wordCount / 180))

  // Tag helper
  const handleAddTag = async () => {
    if (!tagInput.trim()) return
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagInput.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.tag) {
        if (!availableTags.some((t) => t.id === data.tag.id)) {
          setAvailableTags([...availableTags, data.tag])
        }
        if (!selectedTagIds.includes(data.tag.id)) {
          setSelectedTagIds([...selectedTagIds, data.tag.id])
        }
        setTagInput('')
      }
    } catch {
      console.error('Failed to create tag')
    }
  }

  const toggleTag = (id: number) => {
    if (selectedTagIds.includes(id)) {
      setSelectedTagIds(selectedTagIds.filter((t) => t !== id))
    } else {
      setSelectedTagIds([...selectedTagIds, id])
    }
  }

  // Content formatting helper
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('article-content-area') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    const replacement = `${prefix}${selected}${suffix}`

    const newContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 10)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    if (!title.trim() || !content.trim() || !categoryId) {
      setError(language === 'ne' ? 'शीर्षक, समाचार विवरण र विधा अनिवार्य छन्।' : 'Title, content, and category are required.')
      setLoading(false)
      return
    }

    try {
      const payload = {
        title,
        slug,
        subtitle,
        content,
        excerpt,
        featuredImage,
        imageCaption,
        categoryId: Number(categoryId),
        status,
        isBreaking,
        isFeatured,
        scheduledFor: status === 'SCHEDULED' && scheduledFor ? new Date(scheduledFor).toISOString() : null,
        tags: selectedTagIds.map((id) => ({ id })),
      }

      const url = initialData?.id ? `/api/admin/articles/${initialData.id}` : '/api/admin/articles'
      const method = initialData?.id ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save article.')
      }

      setSuccessMsg(
        initialData?.id
          ? language === 'ne'
            ? 'समाचार सफलतापूर्वक अद्यावधिक भयो!'
            : 'Article updated successfully!'
          : language === 'ne'
          ? 'समाचार सफलतापूर्वक सिर्जना भयो!'
          : 'Article created successfully!'
      )

      setTimeout(() => {
        router.push('/admin/articles')
        router.refresh()
      }, 800)
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError('Failed to save article.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/articles')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {initialData?.id
                ? language === 'ne'
                  ? 'समाचार सम्पादन'
                  : 'Edit Article'
                : language === 'ne'
                ? 'नयाँ समाचार लेख्नुहोस्'
                : 'Compose New Article'}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              ~{wordCount} words • ~{readTime} {language === 'ne' ? 'मिनेट पढ्न' : 'min read'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>
              {loading
                ? language === 'ne'
                  ? 'सुरक्षित गर्दै...'
                  : 'Saving...'
                : status === 'PUBLISHED'
                ? language === 'ne'
                  ? 'प्रकाशित गर्नुहोस्'
                  : 'Publish Live'
                : language === 'ne'
                ? 'मस्यौदा सुरक्षित'
                : 'Save Article'}
            </span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-2 text-xs text-red-800 dark:text-red-300">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Editor & Content (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Headline (Title) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                {language === 'ne' ? 'मुख्य समाचार शीर्षक (Headline)' : 'Main Article Headline'} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={language === 'ne' ? 'यहाँ प्रमुख समाचारको आकर्षक शीर्षक लेख्नुहोस्...' : 'Enter a bold, engaging news headline...'}
                className="w-full px-4 py-3 text-base sm:text-lg font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                {language === 'ne' ? 'उपशीर्षक (Subheadline)' : 'Subtitle / Subheadline'}
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder={language === 'ne' ? 'छोटो परिचयात्मक उपशीर्षक...' : 'Secondary headline or clarifying context...'}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                URL Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">/news/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Key Takeaways / Executive Summary (Feature from Blueprint!) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <ListPlus className="w-4 h-4 text-red-600" />
              <span>{language === 'ne' ? 'मुख्य बुँदाहरू (Key Takeaways / TL;DR Summary)' : 'Key Takeaways / Bullet Summary'}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {language === 'ne'
                ? 'पाठकहरूलाई १५ सेकेन्डमा सारांश बुझाउन २-३ मुख्य बुँदाहरू यहाँ लेख्नुहोस्।'
                : '2-3 quick bullet points highlighted in a special box at the top of the article.'}
            </p>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="• First key highlight&#10;• Second crucial development&#10;• Third important outcome"
              className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Rich Content Editor Area */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                {language === 'ne' ? 'समाचार विवरण (Article Body)' : 'Article Body Content'} *
              </label>

              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**')}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('*', '*')}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n## ', '\n')}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  title="Heading 2"
                >
                  <Heading1 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n### ', '\n')}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  title="Heading 3"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n> ', '\n')}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  title="Quote"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              id="article-content-area"
              rows={16}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={language === 'ne' ? 'यहाँ समाचारको पूर्ण विवरण लेख्नुहोस्...' : 'Write the comprehensive story here...'}
              className="w-full p-4 text-sm leading-relaxed rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-serif focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Right Column: Publishing Controls & Media (1 col) */}
        <div className="space-y-5">
          {/* Publication Workflow Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {language === 'ne' ? 'प्रकाशन स्थिति (Publishing)' : 'Publication Workflow'}
            </h3>

            {/* Status Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {language === 'ne' ? 'अवस्था' : 'Status'}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              >
                <option value="DRAFT">Draft (मस्यौदा)</option>
                <option value="REVIEW">In Review (समीक्षाको लागि)</option>
                <option value="PUBLISHED">Published (प्रत्यक्ष प्रकाशित)</option>
                <option value="SCHEDULED">Scheduled (तालिकाबद्ध)</option>
                <option value="ARCHIVED">Archived (अर्काइभ)</option>
              </select>
            </div>

            {/* Scheduling Datetime if SCHEDULED */}
            {status === 'SCHEDULED' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'ne' ? 'प्रकाशन मिति र समय' : 'Schedule For'}
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            )}

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {language === 'ne' ? 'समाचार विधा (Category)' : 'Category'} *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameNe} ({c.nameEn})
                  </option>
                ))}
              </select>
            </div>

            {/* Flags (Breaking & Featured) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold">
                  <Flame className="w-4 h-4" />
                  <span>{language === 'ne' ? 'ताजा अपडेट (Breaking Ticker)' : 'Breaking News Alert'}</span>
                </span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                  <Star className="w-4 h-4" />
                  <span>{language === 'ne' ? 'प्रमुख समाचार (Featured Story)' : 'Featured Story'}</span>
                </span>
              </label>
            </div>
          </div>

          {/* Featured Image & Media Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-slate-500" />
              <span>{language === 'ne' ? 'मुख्य तस्बिर (Featured Image)' : 'Featured Image'}</span>
            </h3>

            {featuredImage ? (
              <div className="space-y-2">
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-800">
                  <Image src={featuredImage} alt="Featured Preview" fill className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setFeaturedImage('')}
                  className="text-[11px] text-red-600 hover:underline"
                >
                  {language === 'ne' ? 'तस्बिर हटाउनुहोस्' : 'Remove Image'}
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                <ImageIcon className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                <span>{language === 'ne' ? 'तस्बिरको URL तल राख्नुहोस्' : 'Provide Image URL below'}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Image URL (Unsplash, CDN or Upload)
                </label>
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="text-[11px] font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{language === 'ne' ? 'मिडिया लाइब्रेरीबाट छान्नुहोस्' : 'Browse Media'}</span>
                </button>
              </div>
              <input
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://... or /uploads/..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {language === 'ne' ? 'तस्बिर क्याप्सन / फोटो क्रेडिट' : 'Image Caption / Photo Credit'}
              </label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="e.g., Photo: Reuters / File"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Tags Assignment Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {language === 'ne' ? 'ट्यागहरू (Tags)' : 'Article Tags'}
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add new tag..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 text-xs font-bold text-white bg-slate-800 dark:bg-slate-700 rounded-xl hover:bg-slate-900"
              >
                +
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
              {availableTags.map((t) => {
                const selected = selectedTagIds.includes(t.id)
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      selected
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    #{t.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url, alt) => {
          setFeaturedImage(url)
          if (alt && !imageCaption) {
            setImageCaption(alt)
          }
        }}
      />
    </form>
  )
}
