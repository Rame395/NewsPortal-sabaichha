import prisma from '@/lib/prisma'
import { TeamMemberItem } from './types'

export interface SyncedAuthor {
  id: string
  teamMemberId?: string
  fullName: string
  avatarUrl: string | null
  email: string
  role?: string
  department?: string
  source: 'TEAM' | 'STAFF'
}

/**
 * Ensures all team members defined in "Our Team" (SiteSetting team_members)
 * have a corresponding User record in the database so they can be assigned
 * as Article authors via foreign key relation.
 */
export async function syncTeamMembersAndGetAuthors(): Promise<SyncedAuthor[]> {
  try {
    // 1. Fetch team members from site settings
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'team_members' },
    })

    let teamMembers: TeamMemberItem[] = []
    if (setting && setting.value) {
      try {
        const parsed = JSON.parse(setting.value)
        if (Array.isArray(parsed.members)) {
          teamMembers = parsed.members.filter((m: TeamMemberItem) => m.isActive !== false)
        }
      } catch (err) {
        console.error('Failed to parse team_members for author sync:', err)
      }
    }

    const authorsList: SyncedAuthor[] = []
    const syncedUserIds = new Set<string>()

    // 2. Synchronize each team member to a User record
    for (const member of teamMembers) {
      const displayName = member.nameNe?.trim() || member.nameEn?.trim() || 'Team Member'
      const avatar = member.avatarUrl?.trim() || null
      const memberEmail = member.email?.trim() || `team_${member.id}@sabaichha.local`

      let user = null

      // First check by member email
      if (member.email && member.email.trim()) {
        user = await prisma.user.findUnique({
          where: { email: member.email.trim() },
        })
      }

      // Second check by fallback team email
      if (!user) {
        user = await prisma.user.findUnique({
          where: { email: memberEmail },
        })
      }

      // Third check by id match
      if (!user) {
        user = await prisma.user.findUnique({
          where: { id: member.id },
        })
      }

      if (user) {
        // Update user's name & avatar if changed in Our Team
        if (user.fullName !== displayName || user.avatarUrl !== avatar) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              fullName: displayName,
              avatarUrl: avatar,
            },
          })
        }
      } else {
        // Create new User record for this team member
        user = await prisma.user.create({
          data: {
            fullName: displayName,
            email: memberEmail,
            avatarUrl: avatar,
            role: 'JOURNALIST',
            passwordHash: '$2a$10$dummyteamprofilehashnotforlogin00000000000000000000',
            mustChangePassword: false,
            isActive: true,
          },
        })
      }

      if (user && !syncedUserIds.has(user.id)) {
        syncedUserIds.add(user.id)
        authorsList.push({
          id: user.id,
          teamMemberId: member.id,
          fullName: displayName,
          avatarUrl: avatar,
          email: user.email,
          role: member.roleNe || member.roleEn,
          department: member.department,
          source: 'TEAM',
        })
      }
    }

    // 3. Add existing staff users who might not be in Our Team
    const staffUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        id: { notIn: Array.from(syncedUserIds) },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
      },
      orderBy: { fullName: 'asc' },
    })

    for (const u of staffUsers) {
      authorsList.push({
        id: u.id,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
        email: u.email,
        source: 'STAFF',
      })
    }

    return authorsList
  } catch (error) {
    console.error('syncTeamMembersAndGetAuthors error:', error)
    // Fallback: return active users
    const fallbackUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, fullName: true, email: true, avatarUrl: true },
      orderBy: { fullName: 'asc' },
    })
    return fallbackUsers.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl,
      email: u.email,
      source: 'STAFF',
    }))
  }
}
