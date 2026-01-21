'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { sendSMS } from '@/lib/sms'
import { revalidatePath } from 'next/cache'

export async function getMessageHistory() {
    const user = await getCurrentUser()
    if (!user) return []

    return await prisma.message.findMany({
        where: { client: { tenantId: user.tenantId } },
        include: { client: true },
        orderBy: { sentAt: 'desc' },
        take: 50
    })
}

export async function sendManualMessage(clientId: string, content: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthenticated')

    const client = await prisma.client.findUnique({ where: { id: clientId } })
    if (!client) throw new Error('Client not found')

    // Send
    const result = await sendSMS({ to: client.mobile, body: content })

    // Log
    if (result.success) {
        await prisma.message.create({
            data: {
                content,
                status: 'DELIVERED', // Mock
                clientId,
            }
        })
        revalidatePath('/messages')
    }
}
