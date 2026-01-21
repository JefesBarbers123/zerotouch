
'use server'

import { searchLocalNumbers, buyNumber } from '@/lib/twilio'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { AREA_CODES } from '@/lib/phone_constants'

export async function checkPhoneStatus() {
    const user = await getCurrentUser()
    if (!user) return null

    return await prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: { twilioNumber: true, twilioSid: true, phone: true, smsAutoReplyEnabled: true, smsAutoReplyMessage: true }
    })
}

export async function searchNumbers(formData: FormData) {
    const areaCode = formData.get('areaCode') as string
    const country = (formData.get('country') as 'GB' | 'US') || 'GB'

    if (!areaCode) {
        throw new Error("Area code is required")
    }

    // Validation against Constants
    const allowedCodes = Object.values(AREA_CODES[country] || {}) as string[]
    if (!allowedCodes.includes(areaCode)) {
        throw new Error(`Invalid area code for ${country}. Allowed: ${allowedCodes.join(', ')}`)
    }

    try {
        const numbers = await searchLocalNumbers(country, areaCode)
        return { success: true, numbers }
    } catch (e) {
        return { success: false, error: (e as Error).message }
    }
}

export async function purchaseNumber(phoneNumber: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    try {
        const rootUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'
        const sid = await buyNumber(phoneNumber, rootUrl)

        // Save to Tenant
        await prisma.tenant.update({
            where: { id: user.tenantId },
            data: {
                twilioNumber: phoneNumber,
                twilioSid: sid
            }
        })

        revalidatePath('/settings/phone')
        return { success: true }
    } catch (e) {
        return { success: false, error: (e as Error).message }
    }
}


export async function updateForwardingSettings(formData: FormData) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    const phone = formData.get('phone') as string
    const smsEnabled = formData.get('smsAutoReplyEnabled') === 'on'

    const smsMessage = formData.get('smsAutoReplyMessage') as string

    // Basic validation
    if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
        return { success: false, error: "Invalid phone number format. Use E.164 (e.g. +447700900000)" }
    }

    try {
        await prisma.tenant.update({
            where: { id: user.tenantId },
            data: {
                phone,
                smsAutoReplyEnabled: smsEnabled,
                smsAutoReplyMessage: smsMessage
            }
        })
        revalidatePath('/settings/phone')
        return { success: true }
    } catch (e) {
        return { success: false, error: "Failed to update settings" }
    }
}
