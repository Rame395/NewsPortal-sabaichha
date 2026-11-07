'use client'

import * as React from 'react'
import { useLanguage } from '@/context/language-context'
import { MediaPickerModal } from './media-picker-modal'
import {
  Undo,
  Redo,
  Printer,
  RemoveFormatting,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Quote,
  Minus,
  Maximize2,
  Minimize2,
  Code,
  Eye,
  Type,
  Video,
  HelpCircle,
  ChevronDown,
  Check,
  Plus,
  Trash2,
  X,
  Palette,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const TEXT_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'Dark Slate', hex: '#1E293B' },
  { name: 'Crimson Red', hex: '#DC2626' },
  { name: 'Navy Blue', hex: '#1D4ED8' },
  { name: 'Forest Green', hex: '#047857' },
  { name: 'Deep Purple', hex: '#7E22CE' },
  { name: 'Amber Orange', hex: '#D97706' },
  { name: 'Dark Gray', hex: '#4B5563' },
]

const HIGHLIGHT_COLORS = [
  { name: 'None', hex: 'transparent' },
  { name: 'Yellow', hex: '#FEF08A' },
  { name: 'Green', hex: '#BBF7D0' },
  { name: 'Cyan', hex: '#A5F3FC' },
  { name: 'Pink', hex: '#FBCFE8' },
  { name: 'Orange', hex: '#FED7AA' },
  { name: 'Purple', hex: '#E9D5FF' },
]

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'यहाँ समाचारको पूर्ण विवरण लेख्नुहोस्...',
}: RichTextEditorProps) {
  const { language } = useLanguage()

  const editorRef = React.useRef<HTMLDivElement | null>(null)
  const savedSelectionRef = React.useRef<Range | null>(null)

  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<'visual' | 'code'>('visual')
  const [zoomLevel, setZoomLevel] = React.useState<number>(100)
  const [fontSize, setFontSize] = React.useState<number>(14)
  const [fontFamily, setFontFamily] = React.useState<string>('sans-serif')

  // Modals & Popovers
  const [isMediaModalOpen, setIsMediaModalOpen] = React.useState(false)
  const [isLinkModalOpen, setIsLinkModalOpen] = React.useState(false)
  const [linkUrl, setLinkUrl] = React.useState('')
  const [linkText, setLinkText] = React.useState('')
  const [showColorPicker, setShowColorPicker] = React.useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = React.useState(false)
  const [showTablePicker, setShowTablePicker] = React.useState(false)
  const [tableGrid, setTableGrid] = React.useState({ rows: 3, cols: 3 })
  const [hoverGrid, setHoverGrid] = React.useState({ rows: 0, cols: 0 })
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = React.useState(false)
  const [youtubeUrl, setYoutubeUrl] = React.useState('')

  // Statistics
  const [stats, setStats] = React.useState({ words: 0, chars: 0, readTime: 1 })

  // Keep editor content in sync with incoming value if not actively editing
  React.useEffect(() => {
    if (editorRef.current && viewMode === 'visual') {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || ''
      }
      updateStats(editorRef.current.innerText || '')
    }
  }, [value, viewMode])

  const updateStats = (text: string) => {
    const trimmed = text.trim()
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0
    const chars = trimmed.length
    const readTime = Math.max(1, Math.ceil(words / 180))
    setStats({ words, chars, readTime })
  }

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      onChange(html)
      updateStats(editorRef.current.innerText || '')
    }
  }

  // Save selection before opening popovers so commands apply to the intended text
  const saveSelection = () => {
    if (typeof window !== 'undefined') {
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0) {
        savedSelectionRef.current = sel.getRangeAt(0).cloneRange()
      }
    }
  }

  const restoreSelection = () => {
    if (typeof window !== 'undefined' && savedSelectionRef.current) {
      const sel = window.getSelection()
      if (sel) {
        sel.removeAllRanges()
        sel.addRange(savedSelectionRef.current)
      }
    }
  }

  // Generic document command executor
  const execCmd = (command: string, val: string | undefined = undefined) => {
    if (viewMode === 'code') return
    if (editorRef.current) {
      editorRef.current.focus()
    }
    document.execCommand(command, false, val)
    handleInput()
  }

  // Google Docs Headings Style
  const setHeadingStyle = (tag: string) => {
    if (tag === 'p') {
      execCmd('formatBlock', '<p>')
    } else {
      execCmd('formatBlock', `<${tag}>`)
    }
  }

  // Font Size
  const changeFontSize = (delta: number) => {
    const newSize = Math.max(10, Math.min(48, fontSize + delta))
    setFontSize(newSize)
    execCmd('fontSize', '3') // Temporary marker
    // Adjust selected span style to exact px
    if (typeof window !== 'undefined') {
      const sel = window.getSelection()
      if (sel && !sel.isCollapsed) {
        document.execCommand('styleWithCSS', false, 'true')
        execCmd('fontSize', '3')
      }
    }
  }

  // Font Family
  const handleFontFamilyChange = (family: string) => {
    setFontFamily(family)
    execCmd('fontName', family)
  }

  // Text Color & Highlight
  const applyTextColor = (hex: string) => {
    restoreSelection()
    execCmd('foreColor', hex)
    setShowColorPicker(false)
  }

  const applyHighlightColor = (hex: string) => {
    restoreSelection()
    if (hex === 'transparent') {
      execCmd('removeFormat')
    } else {
      execCmd('hiliteColor', hex)
    }
    setShowHighlightPicker(false)
  }

  // Links
  const openLinkModal = () => {
    saveSelection()
    if (typeof window !== 'undefined') {
      const sel = window.getSelection()
      setLinkText(sel ? sel.toString() : '')
    }
    setLinkUrl('')
    setIsLinkModalOpen(true)
  }

  const insertLink = (e: React.FormEvent) => {
    e.preventDefault()
    restoreSelection()
    if (!linkUrl.trim()) return

    const formattedUrl = linkUrl.startsWith('http://') || linkUrl.startsWith('https://')
      ? linkUrl.trim()
      : `https://${linkUrl.trim()}`

    if (linkText.trim()) {
      const linkHtml = `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer" class="text-red-600 underline font-semibold hover:text-red-700">${linkText.trim()}</a>`
      execCmd('insertHTML', linkHtml)
    } else {
      execCmd('createLink', formattedUrl)
    }
    setIsLinkModalOpen(false)
  }

  // Image insertion from Media Library
  const handleMediaSelect = (imageUrl: string, altText?: string) => {
    restoreSelection()
    const imgHtml = `
      <figure class="my-6 text-center">
        <img src="${imageUrl}" alt="${altText || 'News story photo'}" class="rounded-2xl max-w-full h-auto mx-auto shadow-sm border border-slate-200" />
        ${altText ? `<figcaption class="text-xs text-slate-500 italic mt-2 text-center">${altText}</figcaption>` : ''}
      </figure>
      <p><br></p>
    `
    execCmd('insertHTML', imgHtml)
    setIsMediaModalOpen(false)
  }

  // Table Insertion (Google Docs style)
  const insertTable = (rows: number, cols: number) => {
    restoreSelection()
    let tableHtml = `
      <table class="w-full my-6 border-collapse border border-slate-300 dark:border-slate-700 text-sm">
        <thead>
          <tr class="bg-slate-100 dark:bg-slate-800">
    `
    for (let c = 0; c < cols; c++) {
      tableHtml += `<th class="border border-slate-300 dark:border-slate-700 p-2.5 font-bold text-left">शीर्षक ${c + 1}</th>`
    }
    tableHtml += `</tr></thead><tbody>`

    for (let r = 0; r < rows; r++) {
      tableHtml += `<tr>`
      for (let c = 0; c < cols; c++) {
        tableHtml += `<td class="border border-slate-300 dark:border-slate-700 p-2.5">विवरण</td>`
      }
      tableHtml += `</tr>`
    }
    tableHtml += `</tbody></table><p><br></p>`

    execCmd('insertHTML', tableHtml)
    setShowTablePicker(false)
  }

  // YouTube Embed
  const insertYoutube = (e: React.FormEvent) => {
    e.preventDefault()
    restoreSelection()
    let videoId = ''
    try {
      if (youtubeUrl.includes('youtu.be/')) {
        videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0]
      } else if (youtubeUrl.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(youtubeUrl).search)
        videoId = urlParams.get('v') || ''
      }
    } catch {}

    if (videoId) {
      const embedHtml = `
        <div class="my-6 aspect-video w-full rounded-2xl overflow-hidden shadow-md">
          <iframe src="https://www.youtube.com/embed/${videoId}" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
        <p><br></p>
      `
      execCmd('insertHTML', embedHtml)
    }
    setIsYoutubeModalOpen(false)
    setYoutubeUrl('')
  }

  // Editorial Blockquote
  const insertEditorialQuote = () => {
    const quoteHtml = `
      <blockquote class="my-6 p-4 sm:p-5 border-l-4 border-red-600 bg-red-50/60 dark:bg-red-950/20 rounded-r-2xl font-serif text-slate-800 dark:text-slate-200 italic leading-relaxed">
        "यहाँ समाचारको महत्वपूर्ण भनाइ वा उद्धरण लेख्नुहोस्..."
      </blockquote>
      <p><br></p>
    `
    execCmd('insertHTML', quoteHtml)
  }

  return (
    <div
      className={`border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm flex flex-col transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none border-none shadow-none h-screen'
          : 'relative min-h-[700px]'
      }`}
    >
      {/* 1. Google Docs Top Menu Bar */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold text-red-600">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <span className="tracking-wide uppercase text-[11px]">
              {language === 'ne' ? 'सबै छ डकुमेन्ट एडिटर' : 'SabaiChha Docs'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
            <button
              type="button"
              onClick={() => {
                if (confirm(language === 'ne' ? 'कागजात खाली गर्न चाहनुहुन्छ?' : 'Clear all content?')) {
                  onChange('')
                }
              }}
              className="hover:text-red-600 transition"
            >
              {language === 'ne' ? 'नयाँ' : 'New'}
            </button>
            <button
              type="button"
              onClick={() => typeof window !== 'undefined' && window.print()}
              className="hover:text-red-600 transition"
            >
              {language === 'ne' ? 'प्रिन्ट' : 'Print'}
            </button>
            <button
              type="button"
              onClick={() => setIsMediaModalOpen(true)}
              className="hover:text-red-600 transition"
            >
              {language === 'ne' ? 'फोटो थप्नुहोस्' : 'Insert Image'}
            </button>
            <button
              type="button"
              onClick={insertEditorialQuote}
              className="hover:text-red-600 transition"
            >
              {language === 'ne' ? 'उद्धरण' : 'Pull Quote'}
            </button>
          </div>
        </div>

        {/* View mode toggle (Visual WYSIWYG vs Raw HTML) & Fullscreen */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg flex items-center text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setViewMode('visual')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                viewMode === 'visual'
                  ? 'bg-white dark:bg-slate-900 text-red-600 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>{language === 'ne' ? 'दृश्य' : 'Visual'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('code')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                viewMode === 'code'
                  ? 'bg-white dark:bg-slate-900 text-red-600 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>HTML</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Zen Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Google Docs Ribbon Toolbar */}
      {viewMode === 'visual' && (
        <div className="bg-[#F8FAFC] dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center gap-1 flex-wrap text-slate-700 dark:text-slate-300 text-xs shadow-2xs">
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => execCmd('undo')}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('redo')}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('removeFormat')}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1"></span>

          {/* Heading / Style Dropdown */}
          <select
            onChange={(e) => setHeadingStyle(e.target.value)}
            defaultValue="p"
            className="h-8 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
          >
            <option value="p">Normal text (सामान्य)</option>
            <option value="h1">Title / Headline (मुख्य शीर्षक)</option>
            <option value="h2">Heading 1 (शीर्षक १)</option>
            <option value="h3">Heading 2 (शीर्षक २)</option>
            <option value="h4">Heading 3 (शीर्षक ३)</option>
          </select>

          {/* Font Family Dropdown */}
          <select
            value={fontFamily}
            onChange={(e) => handleFontFamilyChange(e.target.value)}
            className="h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
          >
            <option value="sans-serif">Arial / Inter</option>
            <option value="Georgia, serif">Georgia (Editorial)</option>
            <option value="'Mukta', sans-serif">Mukta (नेपाली फन्ट)</option>
            <option value="monospace">Courier (Code)</option>
          </select>

          {/* Font Size (+ / -) */}
          <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 h-8 px-1">
            <button
              type="button"
              onClick={() => changeFontSize(-1)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400"
              title="Decrease font size"
            >
              -
            </button>
            <span className="w-7 text-center font-mono font-bold text-xs">{fontSize}</span>
            <button
              type="button"
              onClick={() => changeFontSize(1)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400"
              title="Increase font size"
            >
              +
            </button>
          </div>

          <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1"></span>

          {/* Bold, Italic, Underline, Strikethrough */}
          <button
            type="button"
            onClick={() => execCmd('bold')}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 font-bold transition"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('italic')}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 italic transition"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('underline')}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 underline transition"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('strikeThrough')}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 line-through transition"
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          {/* Text Color Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                saveSelection()
                setShowColorPicker(!showColorPicker)
                setShowHighlightPicker(false)
                setShowTablePicker(false)
              }}
              className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 flex items-center gap-0.5 transition"
              title="Text Color"
            >
              <span className="font-extrabold text-sm border-b-2 border-red-600 leading-none">A</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showColorPicker && (
              <div className="absolute left-0 top-full mt-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-30 grid grid-cols-4 gap-2 w-48">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => applyTextColor(c.hex)}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:scale-110 transition shadow-2xs"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Highlight Color Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                saveSelection()
                setShowHighlightPicker(!showHighlightPicker)
                setShowColorPicker(false)
                setShowTablePicker(false)
              }}
              className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 flex items-center gap-0.5 transition"
              title="Highlight Color"
            >
              <Highlighter className="w-4 h-4 text-amber-500" />
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showHighlightPicker && (
              <div className="absolute left-0 top-full mt-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-30 grid grid-cols-4 gap-2 w-48">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => applyHighlightColor(c.hex)}
                    className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:scale-110 transition text-[10px] font-bold"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {c.name === 'None' ? '✕' : ''}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1"></span>

          {/* Link Button */}
          <button
            type="button"
            onClick={openLinkModal}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Insert Link (Ctrl+K)"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {/* Insert Image from Media Library */}
          <button
            type="button"
            onClick={() => {
              saveSelection()
              setIsMediaModalOpen(true)
            }}
            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 font-bold transition flex items-center gap-1"
            title="Insert Image from Media Library"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="text-[11px] hidden sm:inline">Image</span>
          </button>

          {/* Insert Table Grid Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                saveSelection()
                setShowTablePicker(!showTablePicker)
                setShowColorPicker(false)
                setShowHighlightPicker(false)
              }}
              className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-0.5 transition"
              title="Insert Table"
            >
              <TableIcon className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showTablePicker && (
              <div className="absolute left-0 top-full mt-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-30 space-y-2">
                <p className="text-[11px] font-bold text-slate-500">
                  {hoverGrid.rows > 0 ? `${hoverGrid.rows} x ${hoverGrid.cols} Table` : 'Choose Table Dimensions'}
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((r) =>
                    [1, 2, 3, 4, 5].map((c) => (
                      <div
                        key={`${r}-${c}`}
                        onMouseEnter={() => setHoverGrid({ rows: r, cols: c })}
                        onClick={() => insertTable(r, c)}
                        className={`w-5 h-5 rounded border cursor-pointer transition ${
                          r <= hoverGrid.rows && c <= hoverGrid.cols
                            ? 'bg-red-500 border-red-600'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                        }`}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1"></span>

          {/* Text Alignment */}
          <button
            type="button"
            onClick={() => execCmd('justifyLeft')}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 transition"
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyCenter')}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 transition"
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyRight')}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 transition"
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyFull')}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 transition"
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1"></span>

          {/* Lists & Indent */}
          <button
            type="button"
            onClick={() => execCmd('insertUnorderedList')}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 transition"
            title="Bulleted List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('insertOrderedList')}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 transition"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('outdent')}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 transition"
            title="Decrease Indent"
          >
            <Outdent className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('indent')}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 transition"
            title="Increase Indent"
          >
            <Indent className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1"></span>

          {/* Special Inserts: Quote, Horizontal Rule, Video */}
          <button
            type="button"
            onClick={insertEditorialQuote}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Pull Quote / उद्धरण"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('insertHorizontalRule')}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Horizontal Divider"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              saveSelection()
              setIsYoutubeModalOpen(true)
            }}
            className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 text-red-600 transition"
            title="Embed YouTube Video"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Google Docs Ruler Bar */}
      {viewMode === 'visual' && (
        <div className="bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/80 h-4 flex items-center justify-between px-8 text-[9px] text-slate-400 select-none overflow-hidden">
          <div className="flex items-center gap-16 font-mono">
            <span>| 1</span>
            <span>| 2</span>
            <span>| 3</span>
            <span>| 4</span>
            <span>| 5</span>
            <span>| 6</span>
            <span>| 7</span>
          </div>
          <span className="text-[9px] font-mono">SabaiChha Canvas</span>
        </div>
      )}

      {/* 4. Document Canvas Area */}
      <div
        className={`flex-1 overflow-y-auto bg-[#F1F5F9] dark:bg-slate-950 p-4 sm:p-8 flex justify-center ${
          isFullscreen ? 'min-h-[calc(100vh-140px)]' : 'min-h-[600px]'
        }`}
      >
        {viewMode === 'visual' ? (
          /* Google Docs Paper Sheet */
          <div
            className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_25px_rgba(0,0,0,0.06)] rounded-xs p-8 sm:p-14 min-h-[700px] flex flex-col focus-within:ring-1 focus-within:ring-slate-300 dark:focus-within:ring-slate-700 transition"
            style={{
              zoom: `${zoomLevel}%`,
            }}
          >
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onBlur={handleInput}
              data-placeholder={placeholder}
              className="flex-1 outline-none font-serif text-slate-900 dark:text-slate-100 text-base leading-relaxed space-y-4 [&_p]:my-3.5 [&_p]:leading-[1.8] [&_div]:my-3 [&_div]:leading-[1.8] [&_div:empty]:h-4 [&_p:empty]:h-4 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-red-600 prose-blockquote:border-l-4 prose-blockquote:border-red-600 prose-blockquote:bg-red-50/50 dark:prose-blockquote:bg-red-950/20 prose-blockquote:p-4 prose-blockquote:italic"
            />
          </div>
        ) : (
          /* HTML Source Code Editor */
          <div className="w-full max-w-4xl h-full flex flex-col">
            <textarea
              value={value}
              onChange={(e) => {
                onChange(e.target.value)
                updateStats(e.target.value)
              }}
              className="w-full flex-1 p-6 font-mono text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500 min-h-[600px] resize-y"
              placeholder="Paste or write raw HTML code here..."
            />
          </div>
        )}
      </div>

      {/* 5. Google Docs Status Bar */}
      <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 select-none">
        <div className="flex items-center gap-4">
          <span className="font-semibold">
            {stats.words} {language === 'ne' ? 'शब्दहरू' : 'words'}
          </span>
          <span>•</span>
          <span>
            {stats.chars} {language === 'ne' ? 'अक्षरहरू' : 'characters'}
          </span>
          <span>•</span>
          <span>
            {stats.readTime} {language === 'ne' ? 'मिनेट पढ्न लाग्ने' : 'min read'}
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono">{zoomLevel}%</span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(75, z - 25))}
            className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(150, z + 25))}
            className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleMediaSelect}
      />

      {/* Hyperlink Insertion Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-red-600" />
                <span>{language === 'ne' ? 'लिङ्क थप्नुहोस्' : 'Insert Link'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={insertLink} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'ne' ? 'लिङ्क टेक्स्ट (Text)' : 'Link Text'}
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Read full report here"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'ne' ? 'वेब ठेगाना (URL) *' : 'Destination URL *'}
                </label>
                <input
                  type="text"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://sabaichha.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
                >
                  {language === 'ne' ? 'रद्द' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20"
                >
                  {language === 'ne' ? 'लिङ्क जोड्नुहोस्' : 'Apply Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YouTube Embed Modal */}
      {isYoutubeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-red-600" />
                <span>{language === 'ne' ? 'युट्युब भिडियो राख्नुहोस्' : 'Embed YouTube Video'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsYoutubeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={insertYoutube} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  YouTube Video Link / URL *
                </label>
                <input
                  type="url"
                  required
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsYoutubeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20"
                >
                  Embed Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
