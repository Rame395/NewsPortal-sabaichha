'use client'

import * as React from 'react'
import { useLanguage } from '@/context/language-context'
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Hash,
  X,
  Search,
  Layers,
} from 'lucide-react'

interface CategoryItem {
  id: number
  nameEn: string
  nameNe: string
  slug: string
  description: string | null
  orderIndex: number
  showInMenu: boolean
  parentId: number | null
  parent?: { id: number; nameEn: string; nameNe: string } | null
  children?: { id: number; nameEn: string; nameNe: string; slug: string; orderIndex: number }[]
  _count: { articles: number }
}

interface TagItem {
  id: number
  name: string
  slug: string
  _count: { articles: number }
}

export default function CategoriesManagementPage() {
  const { language } = useLanguage()

  const [categories, setCategories] = React.useState<CategoryItem[]>([])
  const [tags, setTags] = React.useState<TagItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<'categories' | 'tags'>('categories')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<CategoryItem | null>(null)
  const [catNameEn, setCatNameEn] = React.useState('')
  const [catNameNe, setCatNameNe] = React.useState('')
  const [catSlug, setCatSlug] = React.useState('')
  const [catDesc, setCatDesc] = React.useState('')
  const [catParentId, setCatParentId] = React.useState<string>('')
  const [catOrderIndex, setCatOrderIndex] = React.useState(1)
  const [catShowInMenu, setCatShowInMenu] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Tag Modal State
  const [newTagName, setNewTagName] = React.useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [catRes, tagRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/tags'),
      ])
      const catData = await catRes.json()
      const tagData = await tagRes.json()

      if (catRes.ok) setCategories(catData.categories || [])
      if (tagRes.ok) setTags(tagData.tags || [])
    } catch {
      setError('Failed to load categories and tags.')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  // Auto-generate slug from English name
  const handleNameEnChange = (val: string) => {
    setCatNameEn(val)
    if (!editingCategory) {
      setCatSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      )
    }
  }

  const openAddCategoryModal = () => {
    setEditingCategory(null)
    setCatNameEn('')
    setCatNameNe('')
    setCatSlug('')
    setCatDesc('')
    setCatParentId('')
    setCatOrderIndex(categories.length + 1)
    setCatShowInMenu(true)
    setError(null)
    setIsCatModalOpen(true)
  }

  const openEditCategoryModal = (cat: CategoryItem) => {
    setEditingCategory(cat)
    setCatNameEn(cat.nameEn)
    setCatNameNe(cat.nameNe)
    setCatSlug(cat.slug)
    setCatDesc(cat.description || '')
    setCatParentId(cat.parentId ? String(cat.parentId) : '')
    setCatOrderIndex(cat.orderIndex)
    setCatShowInMenu(cat.showInMenu)
    setError(null)
    setIsCatModalOpen(true)
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const payload = {
        nameEn: catNameEn,
        nameNe: catNameNe,
        slug: catSlug,
        description: catDesc,
        parentId: catParentId ? Number(catParentId) : null,
        orderIndex: Number(catOrderIndex),
        showInMenu: catShowInMenu,
      }

      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories'
      const method = editingCategory ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save category.')

      setSuccessMsg(
        editingCategory
          ? language === 'ne'
            ? 'विधा अद्यावधिक भयो।'
            : 'Category updated successfully.'
          : language === 'ne'
          ? 'नयाँ विधा थपियो।'
          : 'New category created successfully.'
      )
      setIsCatModalOpen(false)
      fetchData()
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError('Operation failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCategory = async (cat: CategoryItem) => {
    if (
      !confirm(
        language === 'ne'
          ? `के तपाईं "${cat.nameNe}" विधा मेटाउन चाहनुहुन्छ?`
          : `Are you sure you want to delete category "${cat.nameEn}"?`
      )
    ) {
      return
    }

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to delete category.')
      } else {
        setSuccessMsg(language === 'ne' ? 'विधा सफलतापूर्वक हटाइयो।' : 'Category deleted successfully.')
        fetchData()
      }
    } catch {
      alert('Network error while deleting category.')
    }
  }

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName.trim()) return

    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName }),
      })
      if (res.ok) {
        setNewTagName('')
        fetchData()
      }
    } catch {
      alert('Failed to create tag.')
    }
  }

  const filteredCategories = categories.filter(
    (c) =>
      c.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nameNe.includes(searchTerm) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTags = tags.filter(
    (t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-red-600" />
            <span>{language === 'ne' ? 'विधा तथा ट्याग व्यवस्थापन' : 'Category & Tag Management'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'ne'
              ? 'पोर्टलका मुख्य विधाहरू, उपविधाहरू, प्रदर्शन क्रम र खोज ट्यागहरू मिलाउनुहोस्।'
              : 'Organize primary news categories, subcategories, navigation menu order, and article tags.'}
          </p>
        </div>

        {activeTab === 'categories' && (
          <button
            onClick={openAddCategoryModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ne' ? 'नयाँ विधा थप्नुहोस्' : 'Add Category'}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 px-1 ${
            activeTab === 'categories'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>{language === 'ne' ? 'विधाहरू' : 'Categories'} ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tags')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 px-1 ${
            activeTab === 'tags'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Hash className="w-4 h-4" />
          <span>{language === 'ne' ? 'ट्यागहरू' : 'Tags'} ({tags.length})</span>
        </button>
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

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'categories'
                ? language === 'ne'
                  ? 'विधा खोज्नुहोस्...'
                  : 'Search categories...'
                : language === 'ne'
                ? 'ट्याग खोज्नुहोस्...'
                : 'Search tags...'
            }
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {activeTab === 'tags' && (
          <form onSubmit={handleCreateTag} className="flex items-center gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder={language === 'ne' ? 'नयाँ ट्याग नाम (उदा: चुनाव)' : 'New tag name (e.g., Election)'}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition"
            >
              {language === 'ne' ? 'थप्नुहोस्' : 'Add Tag'}
            </button>
          </form>
        )}
      </div>

      {/* Categories View */}
      {activeTab === 'categories' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">{language === 'ne' ? 'क्रम' : 'Order'}</th>
                  <th className="px-5 py-3.5">{language === 'ne' ? 'विधाको नाम (नेपाली / अंग्रेजी)' : 'Category Name (NE / EN)'}</th>
                  <th className="px-5 py-3.5">{language === 'ne' ? 'स्लग (URL)' : 'Slug'}</th>
                  <th className="px-5 py-3.5">{language === 'ne' ? 'माउ विधा' : 'Parent'}</th>
                  <th className="px-5 py-3.5">{language === 'ne' ? 'मेनुमा देखिने' : 'In Menu'}</th>
                  <th className="px-5 py-3.5">{language === 'ne' ? 'समाचार संख्या' : 'Articles'}</th>
                  <th className="px-5 py-3.5 text-right">{language === 'ne' ? 'कार्य' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                      Loading categories...
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="px-5 py-4 font-mono font-bold text-slate-500">
                        #{c.orderIndex}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {c.nameNe}
                        </div>
                        <div className="text-slate-500 text-[11px]">{c.nameEn}</div>
                      </td>

                      <td className="px-5 py-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        /{c.slug}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {c.parent ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                            {c.parent.nameNe}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {c.showInMenu ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{language === 'ne' ? 'देखिने' : 'Visible'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 font-medium text-[11px]">
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>{language === 'ne' ? 'लुकेको' : 'Hidden'}</span>
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {c._count.articles}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => openEditCategoryModal(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition mr-1"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tags View */}
      {activeTab === 'tags' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap gap-2.5">
            {filteredTags.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <Hash className="w-3.5 h-3.5 text-red-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">{t.name}</span>
                <span className="text-[10px] font-mono text-slate-400">({t._count.articles})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingCategory
                  ? language === 'ne'
                    ? 'विधा सम्पादन गर्नुहोस्'
                    : 'Edit Category'
                  : language === 'ne'
                  ? 'नयाँ विधा थप्नुहोस्'
                  : 'Add New Category'}
              </h2>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {language === 'ne' ? 'नेपाली नाम' : 'Nepali Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={catNameNe}
                    onChange={(e) => setCatNameNe(e.target.value)}
                    placeholder="उदा: राजनीति"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {language === 'ne' ? 'अंग्रेजी नाम' : 'English Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={catNameEn}
                    onChange={(e) => handleNameEnChange(e.target.value)}
                    placeholder="e.g., Politics"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Slug (URL Key) *
                  </label>
                  <input
                    type="text"
                    required
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    placeholder="politics"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    {language === 'ne' ? 'प्रदर्शन क्रम (Order)' : 'Display Order'}
                  </label>
                  <input
                    type="number"
                    value={catOrderIndex}
                    onChange={(e) => setCatOrderIndex(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  {language === 'ne' ? 'माउ विधा (Parent Category)' : 'Parent Category (Optional)'}
                </label>
                <select
                  value={catParentId}
                  onChange={(e) => setCatParentId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">None (Top-Level Primary Category)</option>
                  {categories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameNe} ({c.nameEn})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  {language === 'ne' ? 'विवरण' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Short description of this section..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={catShowInMenu}
                  onChange={(e) => setCatShowInMenu(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>
                  {language === 'ne'
                    ? 'मुख्य नेभिगेसन मेनुमा देखाउने (Show in primary header navigation)'
                    : 'Show in primary header navigation'}
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
