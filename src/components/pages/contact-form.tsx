'use client'

import * as React from 'react'
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Phone,
  Tag,
  FileText,
  MessageSquare,
} from 'lucide-react'
import { useLanguage } from '@/context/language-context'

const INQUIRY_CATEGORIES = [
  { id: 'news_tip', labelNe: 'समाचार सुझाव वा सूचना (News Tip / Scoop)', labelEn: 'News Tip / Scoop' },
  { id: 'advertising', labelNe: 'विज्ञापन तथा बजारीकरण (Advertising & Sponsorship)', labelEn: 'Advertising & Sponsorship' },
  { id: 'editorial', labelNe: 'सम्पादकीय प्रतिक्रिया वा लेख (Editorial / Opinion Article)', labelEn: 'Editorial / Opinion Article' },
  { id: 'press_release', labelNe: 'प्रेस विज्ञप्ति सम्प्रेषण (Press Release Submission)', labelEn: 'Press Release Submission' },
  { id: 'technical', labelNe: 'प्राविधिक सहायता वा त्रुटि (Technical / Bug Report)', labelEn: 'Technical / Bug Report' },
  { id: 'general', labelNe: 'सामान्य सोधपुछ (General Inquiry)', labelEn: 'General Inquiry' },
]

export function ContactForm() {
  const { language } = useLanguage()
  const isNe = language === 'ne'

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    category: INQUIRY_CATEGORIES[0].labelNe,
    subject: '',
    message: '',
  })

  const [submitting, setSubmitting] = React.useState(false)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccessMsg(
          isNe
            ? 'तपाईंको सन्देश सफलतापूर्वक पठाइयो। हाम्रो समाचार कक्षले यथाशीघ्र सम्पर्क गर्नेछ।'
            : 'Your message has been sent successfully. Our editorial desk will be in touch shortly.'
        )
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          category: INQUIRY_CATEGORIES[0].labelNe,
          subject: '',
          message: '',
        })
      } else {
        setErrorMsg(data.error || (isNe ? 'सन्देश पठाउन सकिएन' : 'Failed to send message'))
      }
    } catch {
      setErrorMsg(
        isNe
          ? 'इन्टरनेट वा नेटवर्क त्रुटि, कृपया केही समयपछि पुनः प्रयास गर्नुहोस्।'
          : 'Network error. Please try again later.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
          <MessageSquare className="w-4 h-4" />
          <span>{isNe ? 'अनलाइन सन्देश फारम' : 'Online Inquiry Form'}</span>
        </div>
        <h3 className="text-xl font-black text-slate-950 dark:text-white">
          {isNe ? 'हाम्रो समाचार कक्षलाई सन्देश पठाउनुहोस्' : 'Send a Message to Our Newsroom'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {isNe
            ? 'तलको फारम भरेर हामीलाई आफ्ना सुझाव, समाचार सामग्री वा विज्ञापन सम्बन्धी सोधपुछ पठाउन सक्नुहुन्छ।'
            : 'Fill out the form below to reach our reporters, editors, or marketing team.'}
        </p>
      </div>

      {/* Floating feedback alert */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-extrabold">{isNe ? 'सन्देश प्राप्त भयो!' : 'Message Received!'}</p>
            <p className="font-medium text-emerald-700 dark:text-emerald-400">{successMsg}</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-bold flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-extrabold">{isNe ? 'त्रुटि देखा पर्यो' : 'Error Occurred'}</p>
            <p className="font-medium text-red-600 dark:text-red-300">{errorMsg}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{isNe ? 'पूरा नाम *' : 'Full Name *'}</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={isNe ? 'तपाईंको पूरा नाम...' : 'Your full name...'}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{isNe ? 'इमेल ठेगाना *' : 'Email Address *'}</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@gmail.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{isNe ? 'फोन वा मोबाइल (ऐच्छिक)' : 'Phone Number (Optional)'}</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+977 98XXXXXXXX"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>{isNe ? 'सोधपुछको विधा' : 'Inquiry Category'}</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition cursor-pointer"
            >
              {INQUIRY_CATEGORIES.map((c) => (
                <option key={c.id} value={c.labelNe}>
                  {isNe ? c.labelNe : c.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{isNe ? 'विषय (Subject) *' : 'Subject *'}</span>
          </label>
          <input
            type="text"
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder={isNe ? 'सम्पर्क गर्नुको मुख्य विषय खुलाउनुहोस्...' : 'Main subject of inquiry...'}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>{isNe ? 'विस्तृत सन्देश *' : 'Detailed Message *'}</span>
          </label>
          <textarea
            required
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder={
              isNe
                ? 'यहाँ आफ्नो समाचार सूचना, सुझाव, विज्ञापन विवरण वा टिप्पणी स्पष्ट रूपमा लेख्नुहोस्...'
                : 'Write your message, news scoop, or advertising request here...'
            }
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition resize-y"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#C10A1E] hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/20 hover:shadow-red-600/30 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isNe ? 'पठाउँदै...' : 'Sending...'}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{isNe ? 'सन्देश पठाउनुहोस् (Send Message)' : 'Send Message'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
