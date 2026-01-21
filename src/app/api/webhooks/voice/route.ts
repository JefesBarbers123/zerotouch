
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const from = formData.get('From') as string
        const to = formData.get('To') as string
        const callSid = formData.get('CallSid') as string

        console.log(`📞 Incoming Call from ${from} to ${to}`)

        // 1. Find Tenant by the Twilio Number they "Hired"
        const tenant = await prisma.tenant.findFirst({
            where: { twilioNumber: to }
        })

        const response = new VoiceResponse()

        if (!tenant) {
            console.error("❌ Number not assigned to any tenant")
            response.say("This number is not currently assigned. Goodbye.")
            return new NextResponse(response.toString(), {
                headers: { 'Content-Type': 'text/xml' }
            })
        }

        // 2. Log the Call
        await prisma.callLog.create({
            data: {
                tenantId: tenant.id,
                from: from,
                to: to,
                status: 'RINGING',
                clientName: 'Unknown (Lookup Pending)'
            }
        })

        // 3. Forward to the Shop's Personal Phone
        if (tenant.phone) {
            const forwardTo = tenant.phone.replace(/[^0-9+]/g, '') // Basic cleaning
            console.log(`🔀 Forwarding to ${forwardTo}`)

            // Add action to handle "After Call" events (like Missed Calls)
            const actionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/voice/after-call`

            response.dial({
                action: actionUrl,
                method: 'POST'
            }, forwardTo)
        } else {
            response.say("The shop has not configured a forwarding number. Please try again later.")
        }

        return new NextResponse(response.toString(), {
            headers: { 'Content-Type': 'text/xml' }
        })

    } catch (e) {
        console.error("Webhook Error:", e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
