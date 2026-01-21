'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getAuthUrl, getTokens, listEvents, getPeople } from '@/lib/google'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function connectGoogle(_formData?: FormData) {
    const url = getAuthUrl()
    redirect(url)
}

export async function getGoogleStatus() {
    const user = await getCurrentUser()
    if (!user) return false

    const integration = await prisma.integration.findFirst({
        where: { tenantId: user.tenantId, provider: 'GOOGLE' }
    })
    return !!integration
}

export async function handleGoogleCallback(code: string) {
    try {
        console.log("[Google Callback] Starting exchange for code:", code.substring(0, 10) + "...")
        const user = await getCurrentUser()
        if (!user) {
            console.error("[Google Callback] No user found")
            throw new Error("Unauthorized")
        }

        const tokens = await getTokens(code)
        console.log("[Google Callback] Tokens received")

        // Check if integration exists
        const existing = await prisma.integration.findFirst({
            where: { tenantId: user.tenantId, provider: 'GOOGLE' }
        })

        if (existing) {
            console.log("[Google Callback] Updating existing integration")
            await prisma.integration.update({
                where: { id: existing.id },
                data: {
                    accessToken: tokens.access_token!,
                    refreshToken: tokens.refresh_token || existing.refreshToken, // Keep old refresh if not returned
                    expiresAt: BigInt(tokens.expiry_date || 0)
                }
            })
        } else {
            console.log("[Google Callback] Creating new integration")
            await prisma.integration.create({
                data: {
                    tenantId: user.tenantId,
                    provider: 'GOOGLE',
                    accessToken: tokens.access_token!,
                    refreshToken: tokens.refresh_token,
                    expiresAt: BigInt(tokens.expiry_date || 0)
                }
            })
        }

        console.log("[Google Callback] Success")
    } catch (e) {
        console.error("[Google Callback] Failed:", e)
        throw e
    }

    redirect('/settings/integrations')
}

export async function getIntegrationStatus() {
    const user = await getCurrentUser()
    if (!user) return null
    return await prisma.integration.findFirst({
        where: { tenantId: user.tenantId, provider: 'GOOGLE' }
    })
}

export async function syncCalendar(_formData?: FormData) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    const integration = await prisma.integration.findFirst({
        where: { tenantId: user.tenantId, provider: 'GOOGLE' }
    })

    if (!integration) throw new Error("No Google Account connected")

    // Fetch from Google
    // Note: If expired, we should refresh. Basic implementation for V2:
    const events = await listEvents(integration.accessToken, integration.refreshToken)

    let addedCount = 0

    // Process events
    for (const event of events) {
        const start = event.start?.dateTime
        if (!start) continue; // All day event? skip for now

        // Check if visit exists OR we already synced this event ID
        const existingVisit = await prisma.visit.findFirst({
            where: {
                tenantId: user.tenantId,
                OR: [
                    { googleEventId: event.id }, // Best check
                    { date: new Date(start) }    // Fallback logic
                ]
            }
        })

        if (!existingVisit) {
            const summary = event.summary || "Unknown Booking"

            const service = await prisma.service.findFirst({ where: { tenantId: user.tenantId } })
            if (!service) continue

            let client = await prisma.client.findFirst({ where: { name: 'Google Calendar Import', tenantId: user.tenantId } })
            if (!client) {
                client = await prisma.client.create({
                    data: {
                        name: 'Google Calendar Import',
                        mobile: '000-000-0000',
                        tenantId: user.tenantId
                    }
                })
            }

            await prisma.visit.create({
                data: {
                    date: new Date(start),
                    tenantId: user.tenantId,
                    clientId: client.id,
                    barberId: user.id,
                    serviceId: service.id,
                    status: 'COMPLETED', // auto-complete for revenue visibility
                    notes: `Synced from Google: ${summary}`,
                    googleEventId: event.id
                }
            })
            addedCount++
        }
        addedCount++
    }

    revalidatePath('/dashboard')
    revalidatePath('/check-in')
}

export async function disconnectGoogle(_formData?: FormData) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    await prisma.integration.deleteMany({
        where: { tenantId: user.tenantId, provider: 'GOOGLE' }
    })

    revalidatePath('/settings/integrations')
}

export async function getImportHistory() {
    const user = await getCurrentUser()
    if (!user) return []

    const visits = await prisma.visit.findMany({
        where: {
            tenantId: user.tenantId,
            notes: { contains: 'Synced from Google' }
        },
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { service: true } // Service name might be useful
    })

    return visits.map((v: any) => ({
        id: v.id,
        date: v.date,
        summary: v.notes?.replace('Synced from Google: ', '') || 'Unknown Event',
        createdAt: v.createdAt
    }))
}

export async function syncContacts(_formData?: FormData) {
    const user = await getCurrentUser()
    if (!user) return

    const integration = await prisma.integration.findFirst({
        where: { tenantId: user.tenantId, provider: 'GOOGLE' }
    })

    if (!integration) return

    const connections = await getPeople(integration.accessToken, integration.refreshToken)
    let addedCount = 0

    for (const person of connections) {
        const name = person.names?.[0]?.displayName || 'Unknown Contact'
        const email = person.emailAddresses?.[0]?.value
        const phone = person.phoneNumbers?.[0]?.value

        if (!email && !phone) continue

        // Check for duplicates (Simple check by Email)
        if (email) {
            const existing = await prisma.client.findFirst({
                where: { tenantId: user.tenantId, email }
            })
            if (existing) continue
        }

        await prisma.client.create({
            data: {
                name,
                email: email || undefined,
                mobile: phone || '000-000-0000',
                tenantId: user.tenantId,
                notes: 'Imported from Google Contacts'
            }
        })
        addedCount++
    }

    revalidatePath('/dashboard')
    revalidatePath('/clients')
}
