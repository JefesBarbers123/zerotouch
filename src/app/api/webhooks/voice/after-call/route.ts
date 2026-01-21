
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTwilioClient } from '@/lib/twilio'

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const callStatus = formData.get('DialCallStatus') as string
        const from = formData.get('From') as string
        const to = formData.get('To') as string

        console.log(`📞 Call Completed. Dial Status: ${callStatus}. From: ${from}. To: ${to}`)

        // Logic: If missed call (no-answer, busy, failed, canceled)
        // Note: 'completed' means they answered.
        if (['no-answer', 'busy', 'failed', 'canceled'].includes(callStatus)) {
            console.log("⚠️ Missed Call Detected.")

            // 1. Find Tenant to get the SMS sender ID (the Twilio Number)
            const tenant = await prisma.tenant.findFirst({
                where: { twilioNumber: to }
            })

            if (!tenant) {
                console.error("❌ No tenant found for this number.")
                return NextResponse.json({ status: 'ok' })
            }

            if (!tenant.smsAutoReplyEnabled) {
                console.log("🔕 Auto-Reply disabled by tenant.")
                return NextResponse.json({ status: 'disabled' })
            }

            // 2. Billing Check (Cost ~£0.04 + 10% Profit = £0.05)
            const SMS_PRICE = 0.05

            if (Number(tenant.walletBalance) < SMS_PRICE) {
                console.error("❌ Insufficient funds for Missed Call SMS. Balance:", tenant.walletBalance)
                // Optionally: Send internal alert to tenant?
                return NextResponse.json({ status: 'insufficient_funds' })
            }

            // 3. Send the "Missed Call" SMS
            const client = getTwilioClient()
            try {
                await client.messages.create({
                    body: tenant.smsAutoReplyMessage || "Sorry, I missed your call. Whats up? Ill call you back in a second",
                    from: to, // Reply from the Barber Number
                    to: from  // To the Client
                })
                console.log("✅ Missed Call SMS Sent.")

                // 4. Deduct Balance & Log Transaction
                await prisma.$transaction([
                    prisma.tenant.update({
                        where: { id: tenant.id },
                        data: { walletBalance: { decrement: SMS_PRICE } }
                    }),
                    prisma.walletTransaction.create({
                        data: {
                            tenantId: tenant.id,
                            amount: -SMS_PRICE,
                            type: 'USAGE_SMS',
                            description: 'Missed Call Auto-Reply'
                        }
                    })
                ])

            } catch (smsError) {
                console.error("❌ Failed to send missed call SMS:", smsError)
            }
        }

        return NextResponse.json({ status: 'ok' })
    } catch (e) {
        console.error("After-Call Webhook Error:", e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
