'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getNotifications() {
    const user = await getCurrentUser()
    if (!user) return []

    return await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20
    })
}

export async function markAsRead(notificationId: string) {
    const user = await getCurrentUser()
    if (!user) return

    await prisma.notification.update({
        where: { id: notificationId, userId: user.id }, // Ensure ownership
        data: { read: true }
    })

    revalidatePath('/notifications')
}

export async function markAllAsRead() {
    const user = await getCurrentUser()
    if (!user) return

    await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true }
    })

    revalidatePath('/notifications')
}

// Internal Helper (not exported for client use usually, but useful for other actions)
export async function createNotification(userId: string, title: string, message: string, link?: string, type: string = 'INFO') {
    try {
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                link,
                type
            }
        })
    } catch (error) {
        console.error("Failed to create notification:", error)
    }
}
