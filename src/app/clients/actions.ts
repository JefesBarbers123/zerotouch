'use server'

import { prisma } from '@/lib/prisma'
import { sendSMS, TEMPLATES } from '@/lib/sms'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'

export async function getClients(query?: string) {
    const user = await getCurrentUser()
    if (!user) return []

    const where: any = {
        tenantId: user.tenantId
    }

    if (query) {
        where.name = { contains: query }
    }

    const clients = await prisma.client.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            visits: true, // Include basics
            _count: {
                select: { visits: true }
            }
        }
    })

    // Calculate stats on fly for list? Or just return raw.
    // Page probably expects basics.
    return clients.map((c: any) => ({
        ...c,
        totalVisits: c.visits.length,
        lastVisit: c.visits[0]?.date || null
    }))
}

export async function getClientDetails(id: string) {
    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            visits: {
                include: {
                    service: true,
                    barber: true
                },
                orderBy: { date: 'desc' }
            }
        }
    })

    if (!client) return null

    // Calculate Stats
    const totalVisits = client.visits.length
    const totalSpent = client.visits.reduce((sum, visit) => sum + Number(visit.service.price), 0)

    return {
        ...client,
        stats: {
            totalVisits,
            totalSpent: totalSpent.toFixed(2)
        }
    }
}

export async function requestFeedback(clientId: string) {
    const client = await prisma.client.findUnique({
        where: { id: clientId }
    })

    if (!client) throw new Error("Client not found")
    if (!client.mobile) throw new Error("Client has no mobile number")

    // Send SMS
    const body = TEMPLATES.FEEDBACK_REQUEST.replace('{name}', client.name.split(' ')[0])
    const res = await sendSMS({ to: client.mobile, body })

    if (res.success) {
        // Update State
        await prisma.client.update({
            where: { id: clientId },
            data: { smsFeedbackStatus: 'WAITING_RATING' }
        })

        // Log Message
        await prisma.message.create({
            data: {
                content: body,
                status: 'SENT',
                clientId: client.id
            }
        })

        revalidatePath(`/clients/${clientId}`)
        return { success: true }
    } else {
        return { success: false, error: res.error }
    }
}
