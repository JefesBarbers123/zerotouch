'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function getDashboardStats() {
    const user = await getCurrentUser()
    // For V1 Demo, we'll just show Tenant-wide stats if owner, or personal if barber.
    // Simplifying to Tenant-wide for MVP visualization.

    if (!user) throw new Error("Unauthorized")

    const tenantId = user.tenantId

    // 0. Define scope based on role
    const isOwner = user.role === 'OWNER'
    const scopeFilter = isOwner ? { tenantId } : { tenantId, barberId: user.id }

    // 1. Client Status Counts
    // Note: Clients are currently tenant-wide. 
    // For V1, Barbers see ALL clients status (to help the team).
    // Future: We could filter by "last visited by me". 
    // Let's keep status counts Tenant-Wide for everyone for now (team effort).
    const statusCounts = await prisma.client.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { id: true }
    })

    // 2. Revenue (Mock logic: Sum of visits * service price)
    // Owner sees ALL revenue. Barber sees MY revenue.
    const recentVisits = await prisma.visit.findMany({
        where: {
            tenantId,
            date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) }, // Last 30 days
            status: { not: 'PENDING' }, // Exclude requests
            ...(isOwner ? {} : { barberId: user.id }) // Filter for barber
        },
        include: { service: true }
    })
    const revenue30Days = recentVisits.reduce((sum, v) => sum + Number(v.service.price), 0)

    // 3. Potential Lost Revenue (Overdue + Churned * Avg Service Price)
    // Only relevant for Owner really, or Team.
    // Let's show it to everyone but maybe different label? 
    // Or hide it for barbers? Let's hide 'Lost Revenue' for barbers and show 'My Visits' count instead.

    // Avg Price
    const avgPriceResult = await prisma.service.aggregate({
        _avg: { price: true },
        where: { tenantId }
    })
    const avgPrice = Number(avgPriceResult._avg.price || 40)
    const overdueCount = statusCounts.find(c => c.status === 'OVERDUE')?._count.id || 0
    const churnedCount = statusCounts.find(c => c.status === 'CHURNED')?._count.id || 0
    const potentialLostRevenue = (overdueCount + churnedCount) * avgPrice

    return {
        statusCounts: statusCounts.reduce((acc, curr) => ({ ...acc, [curr.status]: curr._count.id }), {} as Record<string, number>),
        revenue30Days,
        potentialLostRevenue: isOwner ? potentialLostRevenue : null, // Hide for barber
        myVisitCount: isOwner ? null : recentVisits.length, // Show count for barber
        userRole: user.role,
        userName: user.name
    }
}

export async function getAtRiskClients() {
    const user = await getCurrentUser()
    if (!user) return []

    // Definition of "At Risk":
    // 1. Regulars (More than 2 visits) - proving loyalty.
    // 2. Currently OVERDUE - proving risk.
    const results = await prisma.client.findMany({
        where: {
            tenantId: user.tenantId,
            status: 'OVERDUE',
            visits: {
                some: {} // Ideally check count > 2, but prisma generic count filter is tricky in findMany where.
                // We'll filter in memory for V1 or assume OVERDUE is enough filter.
                // Let's rely on mapping.
            }
        },
        include: {
            _count: { select: { visits: true } }
        },
        orderBy: { lastVisitDate: 'asc' }, // Longest overdue first
        take: 5
    })

    // Filter for loyal ones (e.g. at least 3 visits)
    return results.filter(c => c._count.visits >= 3)
}

