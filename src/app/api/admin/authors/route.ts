import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authors = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        email: true,
      },
      orderBy: { fullName: 'asc' },
    })

    return NextResponse.json({ authors })
  } catch (error) {
    console.error('Failed to fetch authors:', error)
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 })
  }
}
