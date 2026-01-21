'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getServices() {
    const user = await getCurrentUser()
    if (!user) return []

    const services = await prisma.service.findMany({
        where: { tenantId: user.tenantId },
        orderBy: { name: 'asc' } // or price
    })
    return services.map(s => ({ ...s, price: s.price.toNumber() }))
}

export async function searchClients(query: string) {
    const user = await getCurrentUser()
    if (!user) return []

    if (!query) return []

    return await prisma.client.findMany({
        where: {
            tenantId: user.tenantId,
            OR: [
                { name: { contains: query } }, // Case sensitive in SQLite, normally.
                { mobile: { contains: query } }
            ]
        },
        take: 5,
        orderBy: { name: 'asc' }
    })
}

export async function createVisit(clientId: string, serviceId: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthenticated')

    // Create Visit
    const visit = await prisma.visit.create({
        data: {
            tenantId: user.tenantId,
            clientId,
            barberId: user.id,
            serviceId,
            date: new Date(),
        }
    })

    // Update Client Retention Logic
    // 1. Mark as ACTIVE
    // 2. Set Expect Return (Standard 4 weeks ?)
    // TODO: Make this smarter based on history
    const today = new Date()
    const expectedReturn = new Date(today)
    expectedReturn.setDate(today.getDate() + 28)

    await prisma.client.update({
        where: { id: clientId },
        data: {
            lastVisitDate: today,
            status: 'ACTIVE',
            expectedReturnDate: expectedReturn
        }
    })

    revalidatePath('/check-in')
    return { success: true, visitId: visit.id }
}

export async function createClient(name: string, mobile: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthenticated')

    const client = await prisma.client.create({
        data: {
            name,
            mobile,
            tenantId: user.tenantId,
            status: 'NEW'
        }
    })
    return client
}
