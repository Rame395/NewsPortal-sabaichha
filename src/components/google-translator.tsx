'use client'

import * as React from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    google?: any
    googleTranslateElementInit?: () => void
  }
}

/**
 * Triggers Google Website Translator to switch the entire page language
 */
export function changeGoogleTranslateLanguage(lang: string) {
  if (typeof window === 'undefined') return

  // Set the standard Google Translate cookie
  const cookieVal = lang === 'ne' ? '/ne/ne' : `/ne/${lang}`
  document.cookie = `googtrans=${cookieVal}; path=/;`
  document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname}`

  const select = document.querySelector<HTMLSelectElement>('.goog-te-combo')
  if (select) {
    select.value = lang
    select.dispatchEvent(new Event('change'))
  } else {
    window.location.reload()
  }
}

export function GoogleTranslator() {
  const pathname = usePathname()

  React.useEffect(() => {
    // Only initialize on public reader-facing pages
    if (pathname?.startsWith('/admin')) return

    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'ne',
            includedLanguages: 'en,ne,hi,zh-CN,es,fr,de,ja,ar',
            autoDisplay: false,
          },
          'google_translate_element'
        )
      }
    }

    if (window.google && window.google.translate) {
      window.googleTranslateElementInit()
    }
  }, [pathname])

  // Don't render on internal staff admin pages
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <>
      {/* Hidden container where Google Translate attaches its combo element */}
      <div id="google_translate_element" className="hidden" aria-hidden="true" />
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  )
}
