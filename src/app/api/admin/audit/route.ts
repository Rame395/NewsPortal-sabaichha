import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/permissions'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || !hasPermission(currentUser.role, currentUser.permissions, 'audit:view')) {
      return NextResponse.json(
        { error: 'Forbidden. You do not have permission to view security audit logs.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(5, parseInt(searchParams.get('limit') || '25', 10)))
    const search = searchParams.get('search')?.trim() || ''
    const action = searchParams.get('action')?.trim() || ''
    const targetType = searchParams.get('targetType')?.trim() || ''
    const userId = searchParams.get('userId')?.trim() || ''
    const days = searchParams.get('days')?.trim() || ''

    const where: Record<string, unknown> = {}

    if (action) {
      where.action = action
    }

    if (targetType) {
      where.targetType = targetType
    }

    if (userId) {
      where.userId = userId
    }

    // Time filter
    if (days === 'today') {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      where.createdAt = { gte: todayStart }
    } else if (days === '7') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      where.createdAt = { gte: sevenDaysAgo }
    } else if (days === '30') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      where.createdAt = { gte: thirtyDaysAgo }
    }

    // Keyword search (details, targetId, or user info)
    if (search) {
      where.OR = [
        { details: { contains: search, mode: 'insensitive' } },
        { targetId: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { targetType: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ]
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [logs, totalCount, totalAllLogs, todayLogsCount, distinctActions, distinctTargets] =
      await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                avatarUrl: true,
              },
            },
          },
        }),
        prisma.auditLog.count({ where }),
        prisma.auditLog.count(),
        prisma.auditLog.count({
          where: { createdAt: { gte: todayStart } },
        }),
        prisma.auditLog.findMany({
          distinct: ['action'],
          select: { action: true },
        }),
        prisma.auditLog.findMany({
          distinct: ['targetType'],
          select: { targetType: true },
        }),
      ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      stats: {
        totalAllLogs,
        todayLogsCount,
        filteredCount: totalCount,
      },
      filters: {
        availableActions: distinctActions.map((a) => a.action),
        availableTargets: distinctTargets.map((t) => t.targetType),
      },
    })
  } catch (error) {
    console.error('Audit logs API error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve security audit logs.' },
      { status: 500 }
    )
  }
}
