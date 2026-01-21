'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { parseBookingText, ParsedBooking } from '@/lib/parser'

// 1. Parse Action
export async function parseText(text: string) {
    const user = await getCurrentUser()
    if (!user) return null

    const services = await prisma.service.findMany({
        where: { tenantId: user.tenantId }
    })

    const parsed = parseBookingText(text, services)
    return parsed
}

// 2. Confirm Action (Reuse existing logic mostly, but specific here)
export async function confirmAssistedVisit(data: ParsedBooking) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    // Find or Create Client
    let client = await prisma.client.findFirst({
        where: { name: data.name, tenantId: user.tenantId }
    })

    if (!client && data.name) {
        client = await prisma.client.create({
            data: {
                name: data.name,
                mobile: '0000000000', // Placeholder
                tenantId: user.tenantId,
                status: 'ACTIVE'
            }
        })
    }

    if (!client) throw new Error("Could not identify client")

    // Find Service
    const service = await prisma.service.findFirst({
        where: { name: data.serviceName, tenantId: user.tenantId }
    })

    // Default service if not found? Or error?
    if (!service) throw new Error("Service not found")

    // Create Visit
    await prisma.visit.create({
        data: {
            tenantId: user.tenantId,
            clientId: client.id,
            barberId: user.id, // Assigned to current user
            serviceId: service.id,
            date: data.date || new Date()
        }
    })

    return { success: true }
}
