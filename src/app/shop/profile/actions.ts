'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getVerifiedShopStats, VerifiedShopStats } from '@/lib/stats'
import { revalidatePath } from 'next/cache'

export async function getShopProfileData() {
    const user = await getCurrentUser()
    if (!user) return null

    // Shop Profile is linked to Tenant, not User directly.
    // Ensure user has rights (e.g. Owner or Admin) - for V1 assume any user in tenant can specific view? 
    // No, usually only Owner.
    // For now, let's allow any auth user to VIEW their shop's profile editor, but maybe restricts edits.

    let profile = await prisma.shopProfile.findUnique({
        where: { tenantId: user.tenantId },
        include: { portfolio: true }
    })

    if (!profile) {
        // Create if doesn't exist? Only if Owner? 
        // Let's safe guards:
        profile = await prisma.shopProfile.create({
            data: { tenantId: user.tenantId },
            include: { portfolio: true }
        })
    }

    const stats: VerifiedShopStats = await getVerifiedShopStats(user.tenantId)

    return { profile, stats, tenantName: user.tenant?.name }
}

export async function updateShopProfile(formData: FormData) {
    const user = await getCurrentUser()
    if (!user) {
        throw new Error("Unauthorized")
    }

    const tenantId = user.tenantId
    const description = formData.get('description') as string
    const website = formData.get('website') as string
    const city = formData.get('city') as string
    const isHiring = formData.get('isHiring') === 'on'
    const isPublic = formData.get('isPublic') === 'on'
    const offeredModels = formData.get('offeredModels') as string

    // Stats (Manual Entry)
    const averageBarberEarnings = parseFloat(formData.get('averageBarberEarnings') as string || '0')
    const weeklyFootfall = parseInt(formData.get('weeklyFootfall') as string || '0', 10)

    await prisma.shopProfile.upsert({
        where: { tenantId },
        create: {
            tenantId,
            description,
            website,
            city,
            isHiring,
            isPublic,
            offeredModels,
            averageBarberEarnings,
            weeklyFootfall
        },
        update: {
            description,
            website,
            city,
            isHiring,
            isPublic,
            offeredModels,
            averageBarberEarnings,
            weeklyFootfall
        }
    })

    revalidatePath('/shop/profile')
}
