'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Toggle Save Shop (For Barbers)
export async function toggleSaveShop(shopProfileId: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    // Get Barber Profile ID
    const barberProfile = await prisma.barberProfile.findUnique({
        where: { userId: user.id }
    })

    if (!barberProfile) throw new Error("Complete your profile first")

    const existing = await prisma.savedShop.findFirst({
        where: { barberId: barberProfile.id, shopId: shopProfileId }
    })

    if (existing) {
        await prisma.savedShop.delete({ where: { id: existing.id } })
    } else {
        await prisma.savedShop.create({
            data: { barberId: barberProfile.id, shopId: shopProfileId }
        })
    }

    revalidatePath('/recruitment')
}

// Toggle Save Barber (For Shops)
export async function toggleSaveBarber(barberProfileId: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    // Get Shop Profile ID (via Tenant)
    const shopProfile = await prisma.shopProfile.findUnique({
        where: { tenantId: user.tenantId }
    })

    if (!shopProfile) throw new Error("Complete shop profile first")

    const existing = await prisma.savedBarber.findFirst({
        where: { shopId: shopProfile.id, barberId: barberProfileId }
    })

    if (existing) {
        await prisma.savedBarber.delete({ where: { id: existing.id } })
    } else {
        await prisma.savedBarber.create({
            data: { shopId: shopProfile.id, barberId: barberProfileId }
        })
    }

    revalidatePath('/recruitment')
}
