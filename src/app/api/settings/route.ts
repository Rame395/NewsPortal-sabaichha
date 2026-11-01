import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/settings'

export async function GET() {
  try {
    const settings = await getSiteSettings()
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Failed to get public settings:', error)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}
