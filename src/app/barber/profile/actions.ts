'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getBarberProfileData() {
    const user = await getCurrentUser()
    if (!user) return null

    let profile = await prisma.barberProfile.findUnique({
        where: { userId: user.id },
        include: { portfolio: true, user: true }
    })

    if (!profile) {
        // Create if doesn't exist
        profile = await prisma.barberProfile.create({
            data: { userId: user.id },
            include: { portfolio: true, user: true }
        })
    }

    return { profile, userName: user.name }
}

export async function updateBarberProfile(formData: FormData) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    const bio = formData.get('bio') as string
    const city = formData.get('city') as string
    const status = formData.get('status') as string
    const isPublic = formData.get('isPublic') === 'on'
    const shareStatsWithVerifiedShops = formData.get('shareStatsWithVerifiedShops') === 'on'

    const experienceYears = parseInt(formData.get('experienceYears') as string || '0', 10)
    const clientBaseSize = parseInt(formData.get('clientBaseSize') as string || '0', 10)
    const retentionRate = parseFloat(formData.get('retentionRate') as string || '0')
    const averageTicket = parseFloat(formData.get('averageTicket') as string || '0')

    await prisma.barberProfile.update({
        where: { userId: user.id },
        data: {
            bio,
            city,
            status,
            isPublic,
            shareStatsWithVerifiedShops,
            experienceYears,
            clientBaseSize,
            retentionRate,
            averageTicket
        }
    })

    revalidatePath('/barber/profile')
}
