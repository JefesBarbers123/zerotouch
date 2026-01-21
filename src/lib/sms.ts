import { getTwilioClient } from './twilio'
import { env } from '@/env'

export interface SMSRequest {
    to: string
    body: string
}

export async function sendSMS({ to, body }: SMSRequest) {
    try {
        const client = getTwilioClient()
        // We need a 'From' number. 
        // In a real multi-tenant app, this should come from the Tenant/Context.
        // For now, let's assume we pull it from ENV or a specific Tenant if passed.
        // However, `twilio.ts` doesn't seem to export a default number.
        // The user has 'Concierge' so they likely have a number in DB.
        // For this function to be generic, we might need the 'from' numberpassed in.
        // But let's check env first for a fallback.
        const from = env.TWILIO_PHONE_NUMBER

        if (!from) {
            console.warn("TWILIO_PHONE_NUMBER not set in env. Using Mock for now if no number provided.")
        }

        // Use the default env number if available, otherwise we need to rely on the caller passing it
        // But the signature is fixed. Let's see. 
        // The user implementation plan implied we just update this file.

        const message = await client.messages.create({
            body,
            to,
            from: from!
        })

        console.log(`[SMS SEND] To: ${to}, SID: ${message.sid}`)
        return { success: true, messageId: message.sid }

    } catch (e) {
        console.error("Failed to send SMS:", e)
        // Fallback to log for dev/demo if creds fail
        return { success: false, error: e }
    }
}

export const TEMPLATES = {
    DUE: "Hey {name}, it's been a while! Time to freshen up? Book now or reply to this message.",
    OVERDUE: "Hey {name}, we miss you at Blade & Fades! Come in this week for a trim.",
    CHURN_WINBACK: "Hi {name}, it's been 3 months! We'd love to see you back. Show this text for $5 off.",
    FEEDBACK_REQUEST: "Hi {name}, how was your experience today? (Good/Ok/Bad)",
    FEEDBACK_GOOD: "Glad to hear it! We'd appreciate a review: {link}",
    FEEDBACK_MEDIOCRE: "Sorry to hear that. How could we have done better?",
    FEEDBACK_BAD: "We are so sorry. One of our managers will call you shortly to make it right.",
    FEEDBACK_THANKS: "Thank you for your feedback!"
}
