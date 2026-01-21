'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getVerifiedBarberStats, VerifiedBarberStats } from '@/lib/stats'
import { revalidatePath } from 'next/cache'
import { createNotification } from '../actions/notifications'

export async function getBarberProfileData() {
    const user = await getCurrentUser()
    if (!user) return null

    // 1. Get or Create Profile
    let profile = await prisma.barberProfile.findUnique({
        where: { userId: user.id },
        include: { portfolio: true }
    })

    if (!profile) {
        profile = await prisma.barberProfile.create({
            data: { userId: user.id },
            include: { portfolio: true }
        })
    }

    // 2. Get Verified Stats (Read-Only)
    const stats: VerifiedBarberStats = await getVerifiedBarberStats(user.id, user.tenantId)

    return { profile, stats, user }
}

export async function updateBarberProfile(formData: FormData) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    const bio = formData.get('bio') as string
    const city = formData.get('city') as string
    const instagram = formData.get('instagram') as string
    const status = formData.get('status') as string
    const isPublic = formData.get('isPublic') === 'on'
    const profileImage = formData.get('profileImage') as string
    const portfolioImagesRaw = formData.get('portfolioImages') as string // JSON

    // Get old status to check for change
    const oldProfile = await prisma.barberProfile.findUnique({
        where: { userId: user.id },
        include: { user: true }
    })

    // Update Profile & Sync Portfolio
    await prisma.$transaction(async (tx) => {
        // 1. Update Core Profile
        await tx.barberProfile.update({
            where: { userId: user.id },
            data: {
                bio,
                city,
                instagram,
                status,
                isPublic,
                profileImage
            }
        })

        // 2. Sync Portfolio (Delete all and re-create for simplicity)
        if (portfolioImagesRaw) {
            const images = JSON.parse(portfolioImagesRaw) as string[]

            // Verify count limit (max 5)
            if (images.length > 5) throw new Error("Max 5 portfolio images allowed")

            // Delete old
            await tx.portfolioImage.deleteMany({
                where: { barberProfileId: oldProfile?.id }
            })

            // Create new
            for (const img of images) {
                await tx.portfolioImage.create({
                    data: {
                        url: img,
                        barberProfileId: oldProfile!.id
                    }
                })
            }
        }
    })

    // NOTIFICATION LOGIC
    // If status changed to "Looking", find shops that saved this barber
    if (oldProfile && oldProfile.status !== status && (status === 'ACTIVELY_LOOKING' || status === 'OPEN_TO_OPPORTUNITIES')) {
        console.log(`🔔 Status Change Detected: ${user.name} is now ${status}`)

        const interestedShops = await prisma.savedBarber.findMany({
            where: { barberId: oldProfile.id },
            include: {
                shop: {
                    include: {
                        tenant: {
                            include: { users: true }
                        }
                    }
                }
            }
        })

        if (interestedShops.length > 0) {
            console.log(`📧 Creating Actions for ${interestedShops.length} Interested Shops...`)

            for (const saved of interestedShops) {
                const shopTenant = saved.shop.tenant
                const usersToNotify = shopTenant.users || [] // Ensure users array exists

                // If users is undefined (forgot to include?), let's trust the include above... 
                // Wait, previous replace had include users. Let's make sure it's included.

                for (const recipient of usersToNotify) {
                    await createNotification(
                        recipient.id,
                        `Talent Alert: ${user.name}`,
                        `${user.name} is now ${status.replace(/_/g, ' ')}. Check their profile!`,
                        `/recruitment`,
                        'ALERT'
                    )
                }
            }
        }
    }

    revalidatePath('/profile')
}
