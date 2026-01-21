
import { prisma } from '@/lib/prisma'

export interface VerifiedBarberStats {
    avgClientsPerWeek: number
    rebookingRate: number
    clientRetention: number
    avgTicket: number
    totalVisits: number
}

export interface VerifiedShopStats {
    avgClientsPerWeek: number
    clientGrowthRate: number
    reviewScore: number // Placeholder for now, maybe avg rating if we had it
    totalBarbers: number
}

/**
 * Calculates verified performance stats for a specific Barber (User).
 * These are READ-ONLY and derived directly from the Visits table.
 */
export async function getVerifiedBarberStats(barberId: string, tenantId: string): Promise<VerifiedBarberStats> {
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const ninetyDaysAgo = new Date(now)
    ninetyDaysAgo.setDate(now.getDate() - 90)

    // 1. Avg Clients Per Week (Last 90 Days)
    const recentVisits = await prisma.visit.count({
        where: {
            barberId,
            tenantId,
            status: 'COMPLETED',
            date: { gte: ninetyDaysAgo }
        }
    })
    const avgClientsPerWeek = Math.round(recentVisits / 12 * 10) / 10 // 12 weeks approx

    // 2. Retention (Clients with > 1 visit / Total Clients saw in last 90 days)
    // First, find all unique clients visited in last 90 days
    const recentVisitsList = await prisma.visit.findMany({
        where: {
            barberId,
            tenantId,
            status: 'COMPLETED',
            date: { gte: ninetyDaysAgo }
        },
        select: { clientId: true },
        distinct: ['clientId']
    })

    const clientIds = recentVisitsList.map(v => v.clientId)

    if (clientIds.length === 0) {
        return { avgClientsPerWeek: 0, rebookingRate: 0, clientRetention: 0, avgTicket: 0, totalVisits: 0 }
    }

    // Checking how many of these have > 1 visit LIFETIME with this barber
    // (A strict retention metric might check returning within X days, but this is a good V1 proxy)
    const returningClientsCount = await prisma.visit.groupBy({
        by: ['clientId'],
        where: {
            barberId,
            clientId: { in: clientIds },
            status: 'COMPLETED'
        },
        _count: {
            id: true
        },
        having: {
            id: {
                _count: { gt: 1 }
            }
        }
    })

    const clientRetention = Math.round((returningClientsCount.length / clientIds.length) * 100)

    // 3. Avg Ticket (Last 90 days)
    // We need to join with Service to get price
    const visitsWithPrice = await prisma.visit.findMany({
        where: {
            barberId,
            tenantId,
            status: 'COMPLETED',
            date: { gte: ninetyDaysAgo }
        },
        include: { service: true }
    })

    const totalRevenue = visitsWithPrice.reduce((sum, v) => sum + Number(v.service.price), 0)
    const avgTicket = visitsWithPrice.length > 0
        ? Math.round(totalRevenue / visitsWithPrice.length)
        : 0

    // 4. Rebooking Rate (Placeholder Logic for V1: similar to retention but timeframe based?)
    // Let's use Retention as the primary trust signal for now.
    // We can define Rebooking as "% of appointments where client booked again within 4 weeks"
    // Keep it simple: use Retention for now.

    return {
        avgClientsPerWeek,
        rebookingRate: clientRetention, // simplified proxy for v1
        clientRetention,
        avgTicket,
        totalVisits: recentVisits
    }
}

/**
 * Calculates verified shop stats.
 */
export async function getVerifiedShopStats(tenantId: string): Promise<VerifiedShopStats> {
    // 1. Total Barbers
    const barbers = await prisma.user.count({
        where: { tenantId, role: 'BARBER' }
    })

    // 2. Avg Clients Per Week (Last 30 days)
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const monthlyVisits = await prisma.visit.count({
        where: {
            tenantId,
            status: 'COMPLETED',
            date: { gte: thirtyDaysAgo }
        }
    })

    const avgClientsPerWeek = Math.round(monthlyVisits / 4)

    return {
        avgClientsPerWeek,
        clientGrowthRate: 5, // Placeholder: need historical snapshot data for growth rate
        reviewScore: 4.8, // Placeholder
        totalBarbers: barbers
    }
}
