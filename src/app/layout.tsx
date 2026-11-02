import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/context/language-context'
import { GoogleTranslator } from '@/components/google-translator'

export const metadata: Metadata = {
  title: 'सबै छ डट कम | SabaiChha.com - Full-Stack Dynamic News Portal',
  description: 'सूचना संवाद र मनोरञ्जनको संगम, सबै छ डट कम (SabaiChha.com)',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ne" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased flex flex-col font-sans transition-colors">
        <ThemeProvider defaultTheme="light">
          <LanguageProvider>
            {children}
            {/* Google Website Translator Widget */}
            <GoogleTranslator />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
