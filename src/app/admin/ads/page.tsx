import { Metadata } from 'next'
import { AdManager } from '@/components/admin/ad-manager'

export const metadata: Metadata = {
  title: 'विज्ञापन व्यवस्थापन (Ad Management) | SabaiChha Admin',
  description: 'Manage banner slots, Google AdSense, and track impression/click conversions.',
}

export default function AdminAdsPage() {
  return <AdManager />
}
