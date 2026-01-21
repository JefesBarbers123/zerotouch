'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function getDiscoveryData(query?: string, location?: string, sort?: string) {
    const user = await getCurrentUser()
    if (!user) return null

    // Base filters
    const barberWhere: any = {
        isPublic: true,
        status: { in: ['ACTIVELY_LOOKING', 'OPEN_TO_OPPORTUNITIES'] }
    }
    const shopWhere: any = {
        isPublic: true,
        isHiring: true
    }

    // Apply Search Logic (Location only now, Query removed for Rank)
    if (location) {
        barberWhere.city = { contains: location }
        shopWhere.city = { contains: location }
    }

    // Determine Sort Order
    // Priority 1: Verified Status (Verified first)
    // Priority 2: Selected Sort Metric (or Update Time)
    const barberOrderBy: any[] = [{ isVerified: 'desc' }]
    const shopOrderBy: any[] = [{ isVerified: 'desc' }]

    if (sort) {
        // Barber Specific Sorts
        if (['retentionRate', 'clientBaseSize', 'averageTicket', 'experienceYears'].includes(sort)) {
            barberOrderBy.push({ [sort]: 'desc' })
        }

        // Shop Specific Sorts
        if (['averageBarberEarnings', 'weeklyFootfall'].includes(sort)) {
            shopOrderBy.push({ [sort]: 'desc' })
        }
    }

    // Default Fallback
    barberOrderBy.push({ updatedAt: 'desc' })
    shopOrderBy.push({ updatedAt: 'desc' })

    // Get Active Barbers
    const barbersRaw = await prisma.barberProfile.findMany({
        where: barberWhere,
        include: {
            user: { select: { name: true, email: true } },
            portfolio: { take: 1 }
        },
        orderBy: barberOrderBy
    })

    // PRIVACY & REDACTION LOGIC
    // Rule: Stats only visible if:
    // 1. Viewer is a Verified Shop (Owner)
    // 2. Barber has opted in (shareStatsWithVerifiedShops = true)

    let isViewerVerifiedShop = false
    if (user && user.role === 'OWNER') {
        const viewerShop = await prisma.shopProfile.findUnique({
            where: { tenantId: user.tenantId },
            select: { isVerified: true }
        })
        isViewerVerifiedShop = !!viewerShop?.isVerified
    }

    const barbers = barbersRaw.map((barber: any) => {
        const canViewStats = isViewerVerifiedShop && barber.shareStatsWithVerifiedShops

        if (!canViewStats) {
            return {
                ...barber,
                experienceYears: 0,
                clientBaseSize: 0,
                retentionRate: 0,
                averageTicket: 0,
                isRedacted: true // Flag for UI
            }
        }
        return { ...barber, isRedacted: false }
    })

    // Get Hiring Shops
    const shops = await prisma.shopProfile.findMany({
        where: shopWhere,
        include: {
            tenant: { select: { name: true, address: true } },
            portfolio: { take: 1 }
        },
        orderBy: shopOrderBy
    })

    return { barbers, shops, user }
}
