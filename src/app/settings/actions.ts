'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getServices() {
    const user = await getCurrentUser()
    if (!user) return []

    const services = await prisma.service.findMany({
        where: { tenantId: user.tenantId },
        orderBy: { name: 'asc' }
    })

    return services.map((s: any) => ({
        ...s,
        price: s.price.toNumber()
    }))
}


export async function createService(formData: FormData) {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const name = formData.get('name') as string
    const priceStr = formData.get('price') as string
    const durationStr = formData.get('duration') as string

    // Validate
    if (!name) return { success: false, error: "Name is required" }
    const price = parseFloat(priceStr)
    if (isNaN(price)) return { success: false, error: "Invalid price" }
    const duration = parseInt(durationStr) || 30

    try {
        await prisma.service.create({
            data: {
                name,
                price,
                duration,
                tenantId: user.tenantId
            }
        })
        revalidatePath('/settings')
        revalidatePath('/check-in')
        return { success: true }
    } catch (e) {
        console.error(e)
        return { success: false, error: "Failed to create service" }
    }
}

export async function updateService(serviceId: string, formData: FormData) {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const name = formData.get('name') as string
    const priceStr = formData.get('price') as string
    const durationStr = formData.get('duration') as string

    const price = parseFloat(priceStr)
    const duration = parseInt(durationStr)

    try {
        await prisma.service.update({
            where: { id: serviceId, tenantId: user.tenantId },
            data: {
                name,
                price: isNaN(price) ? undefined : price,
                duration: isNaN(duration) ? undefined : duration
            }
        })
        revalidatePath('/settings')
        return { success: true }
    } catch (e) {
        return { success: false, error: "Failed to update service" }
    }
}

export async function deleteService(serviceId: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    // TODO: Check if used in visits? For V1 just allow delete (cascade might fail if no relation set, or it might dangle)
    // Schema says: visits Visit[]
    // If we delete service, visits might break. 
    // Let's safe delete or just try. Prisma default for optional relation is SetNull, but here it's mandatory.
    // Actually schema says: service Service @relation(...)
    // So we can't delete if visits exist unless we cascade or update visits.
    // For V1, let's wrap in try/catch and return error if fails.

    try {
        await prisma.service.delete({
            where: {
                id: serviceId,
                tenantId: user.tenantId
            }
        })
        revalidatePath('/settings')
        revalidatePath('/check-in')
        return { success: true }
    } catch (e) {
        return { success: false, error: "Cannot delete service that has existing visits." }
    }
}

// --- Settings 2.0 Actions ---

export async function getTenantProfile() {
    const user = await getCurrentUser()
    if (!user) return null
    return await prisma.tenant.findUnique({
        where: { id: user.tenantId }
    })
}

export async function updateTenantProfile(formData: FormData) {
    const user = await getCurrentUser()
    if (!user || user.role !== 'OWNER') throw new Error("Unauthorized")

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const churnThresholdDaysStr = formData.get('churnThresholdDays') as string
    let churnThresholdDays = parseInt(churnThresholdDaysStr)
    if (isNaN(churnThresholdDays)) churnThresholdDays = 28 // Safe fallback

    const retentionSmsEnabled = formData.get('retentionSmsEnabled') === 'on'

    try {
        await prisma.tenant.update({
            where: { id: user.tenantId },
            data: { name, phone, address, churnThresholdDays, retentionSmsEnabled }
        })
        revalidatePath('/settings')
        revalidatePath('/', 'layout') // Ensure header/nav updates
    } catch (e) {
        console.error("Failed to update tenant profile:", e)
        throw new Error("Failed to update profile")
    }
}

export async function getTeamMembers() {
    const user = await getCurrentUser()
    if (!user) return []
    return await prisma.user.findMany({
        where: { tenantId: user.tenantId },
        orderBy: { name: 'asc' }
    })
}

export async function inviteBarber(formData: FormData) {
    const user = await getCurrentUser()
    if (!user || user.role !== 'OWNER') throw new Error("Unauthorized")

    const name = formData.get('name') as string
    const email = formData.get('email') as string

    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error("User with this email already exists")

    await prisma.user.create({
        data: {
            name,
            email, // Email is unique
            role: 'BARBER',
            tenantId: user.tenantId
        }
    })

    // Send Invite Email
    await import('@/lib/email').then(({ sendEmail }) =>
        sendEmail({
            to: email,
            subject: 'You have been invited to Zerotouches',
            html: `<p>Hi ${name},</p><p>You have been invited to join ${user.tenant.name} on Zerotouches.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/login">Click here to login</a></p>`
        })
    )
    revalidatePath('/settings')
    revalidatePath('/login')
}

export async function deleteTeamMember(formData: FormData) {
    const user = await getCurrentUser()
    if (!user || user.role !== 'OWNER') throw new Error("Unauthorized")

    const userId = formData.get('userId') as string

    if (userId === user.id) throw new Error("Cannot delete yourself")

    await prisma.user.delete({ where: { id: userId } })
    revalidatePath('/settings')
    revalidatePath('/login')
}

export async function updateUserProfile(formData: FormData) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    const emailNotificationsEnabled = formData.get('emailNotificationsEnabled') === 'on'

    await prisma.user.update({
        where: { id: user.id },
        data: { emailNotificationsEnabled }
    })

    revalidatePath('/settings')
    revalidatePath('/', 'layout')
}
