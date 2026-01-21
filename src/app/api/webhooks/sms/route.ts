import { prisma } from '@/lib/prisma'
import { sendSMS, TEMPLATES } from '@/lib/sms'
import { sendEmail } from '@/lib/email'
import { headers } from 'next/headers'
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    const body = await req.text()
    const params = new URLSearchParams(body)
    const From = params.get('From')
    const Body = params.get('Body')?.trim()

    if (!From || !Body) {
        return new Response('Missing From or Body', { status: 400 })
    }

    console.log(`[SMS RECEIVE] From: ${From}, Body: "${Body}"`)

    // 1. Find Client
    const client = await prisma.client.findFirst({
        where: { mobile: From } // Assuming exact match or need normalization
    })

    const twiml = new MessagingResponse()

    if (!client) {
        console.log("Client not found for number:", From)
        // Optional: Auto-create lead? For now, ignore or generic reply.
        return new Response(twiml.toString(), { headers: { 'Content-Type': 'text/xml' } })
    }

    // 2. Check State
    const state = client.smsFeedbackStatus
    console.log(`[SMS STATE] Client: ${client.id}, State: ${state}`)

    // 3. Logic
    let responseText = ""
    let nextState = "IDLE" // Default reset unless we want to stay in a flow

    if (state === 'WAITING_RATING') {
        const lowerBody = Body.toLowerCase()
        if (lowerBody.includes('good') || lowerBody.includes('great') || lowerBody.includes('amazing') || lowerBody.includes('love')) {
            responseText = TEMPLATES.FEEDBACK_GOOD.replace('{link}', 'https://google.com/review') // Replace with real link
            nextState = 'COMPLETED_GOOD'
        } else if (lowerBody.includes('bad') || lowerBody.includes('terrible') || lowerBody.includes('awful') || lowerBody.includes('hate')) {
            responseText = TEMPLATES.FEEDBACK_BAD
            nextState = 'COMPLETED_BAD'

            // Notify Admin/Manager
            try {
                console.log("[SMS BAD FEEDBACK] Notifying admin...")
                // Find Tenant Owner (Assuming single owner for now, or just notify the user associated with the client's tenant)
                // We need the Client's Tenant.
                const clientWithTenant = await prisma.client.findUnique({
                    where: { id: client.id },
                    include: { tenant: { include: { users: { where: { role: 'OWNER' } } } } }
                })

                const owner = clientWithTenant?.tenant.users[0]
                if (owner && owner.email) {
                    console.log(`[SMS BAD FEEDBACK] Sending email to ${owner.email}`)
                    await sendEmail({
                        to: owner.email,
                        subject: `URGENT: Negative Feedback from ${From}`,
                        text: `Client ${From} replied: "${Body}". Please follow up immediately.`
                    })
                } else {
                    console.warn("[SMS BAD FEEDBACK] No owner email found.")
                }
            } catch (e) {
                console.error("Failed to notify admin of bad feedback:", e)
            }
        } else {
            // Assume mediocre or just chatter
            responseText = TEMPLATES.FEEDBACK_MEDIOCRE
            nextState = 'WAITING_IMPROVEMENT'
        }
    } else if (state === 'WAITING_IMPROVEMENT') {
        responseText = TEMPLATES.FEEDBACK_THANKS
        nextState = 'COMPLETED_NEUTRAL'
    } else {
        // IDLE or generic message.
        // Check for keywords? Or just auto-reply with concierge default (already in DB?)
        // The User said "add this feature to the concierge section".
        // If it's just a normal message, we should probably let the existing system handle it or fallback.
        // For now, let's just log it if not in feedback flow.
        console.log("Not in feedback flow. Message logged.")
        return new Response(twiml.toString(), { headers: { 'Content-Type': 'text/xml' } })
    }

    // 4. Update State and Send Reply
    if (responseText) {
        // Save incoming message
        await prisma.message.create({
            data: {
                content: Body,
                status: 'RECEIVED',
                clientId: client.id
            }
        })

        // Update Client Status
        await prisma.client.update({
            where: { id: client.id },
            data: { smsFeedbackStatus: nextState }
        })

        // Send Reply (Twilio Webhook Response)
        twiml.message(responseText)

        // Save outgoing message
        await prisma.message.create({
            data: {
                content: responseText,
                status: 'SENT',
                clientId: client.id
            }
        })
    }

    return new Response(twiml.toString(), { headers: { 'Content-Type': 'text/xml' } })
}
