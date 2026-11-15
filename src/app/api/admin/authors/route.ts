import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { syncTeamMembersAndGetAuthors } from '@/lib/settings/team-sync'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authors = await syncTeamMembersAndGetAuthors()

    return NextResponse.json({ authors })
  } catch (error) {
    console.error('Failed to fetch authors:', error)
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 })
  }
}
