import { Metadata } from 'next'
import { NewsletterManager } from '@/components/admin/newsletter-manager'

export const metadata: Metadata = {
  title: 'इमेल बुलेटिन (Newsletter) | SabaiChha Admin',
  description: 'Manage reader newsletter subscribers, view email list, and export CSV.',
}

export default function AdminNewsletterPage() {
  return <NewsletterManager />
}
