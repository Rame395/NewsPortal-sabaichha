import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/context/language-context'
import { GoogleTranslator } from '@/components/google-translator'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabaichha.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'सबै छ डट कम | SabaiChha.com - नेपालको डिजिटल अनलाइन पत्रिका',
    template: '%s | SabaiChha.com',
  },
  description:
    'सूचना, संवाद र मनोरञ्जनको संगम - सबै छ डट कम (SabaiChha.com)। ताजा समाचार, राजनीति, विचार, अर्थ, समाज, खेलकुद, राशिफल र उपयोगी औजारहरू।',
  keywords: [
    'नेपाली समाचार',
    'ताजा खबर',
    'Nepal News',
    'Nepali News Portal',
    'SabaiChha',
    'सबै छ',
    'राजनीति',
    'अर्थतन्त्र',
    'खेलकुद',
    'राशिफल',
    'सुनचाँदीको भाउ',
    'विदेशी मुद्रा',
    'मिति रूपान्तरक',
  ],
  authors: [{ name: 'SabaiChha Newsroom', url: SITE_URL }],
  creator: 'SabaiChha Media Group',
  publisher: 'SabaiChha.com',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      'application/rss+xml': `${SITE_URL}/feed.xml`,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'ne_NP',
    url: SITE_URL,
    siteName: 'SabaiChha.com | सबै छ डट कम',
    title: 'सबै छ डट कम | SabaiChha.com - नेपालको डिजिटल अनलाइन पत्रिका',
    description: 'सूचना, संवाद र मनोरञ्जनको संगम - ताजा नेपाली समाचार, विश्लेषण, र उपयोगी औजारहरू।',
    images: [
      {
        url: `${SITE_URL}/logo-v2.jpg`,
        width: 1200,
        height: 630,
        alt: 'SabaiChha.com News Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'सबै छ डट कम | SabaiChha.com',
    description: 'नेपालको आधिकारिक डिजिटल अनलाइन पत्रिका - ताजा समाचार तथा विचार',
    images: [`${SITE_URL}/logo-v2.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// Global Organization & WebSite JSON-LD Schema
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  name: 'सबै छ डट कम (SabaiChha.com)',
  url: SITE_URL,
  logo: `${SITE_URL}/logo-v2.jpg`,
  description: 'नेपालको आधिकारिक डिजिटल अनलाइन पत्रिका - ताजा समाचार, विचार, समाज र खेलकुद।',
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SabaiChha.com',
  url: SITE_URL,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ne" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased flex flex-col font-sans">
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
