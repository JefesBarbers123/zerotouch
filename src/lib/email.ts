import { Resend } from 'resend'
import { env } from '@/env'

// env.RESEND_API_KEY is validated (optional)

export async function sendEmail({ to, subject, html, text }: { to: string, subject: string, html?: string, text?: string }) {
    if (!env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is missing. Email not sent.")
        return { success: false, error: "Missing API Key" }
    }

    const resend = new Resend(env.RESEND_API_KEY)

    try {
        const { data, error } = await resend.emails.send({
            from: 'Concierge <onboarding@resend.dev>', // Update this if user has a domain
            to: [to],
            // bcc: ['admin@barber.com'], // Optional: hidden copy to admin
            subject: subject,
            html: html,
            text: text
        } as any)

        if (error) {
            console.error("Resend Error:", error)
            return { success: false, error }
        }

        if (data) {
            console.log(`[EMAIL SENT] To: ${to}, Subject: "${subject}", ID: ${data.id}`)
        }
        return { success: true, data }
    } catch (e) {
        console.error("Email Exception:", e)
        return { success: false, error: e }
    }
}

export async function sendNotification({ userId, subject, html, text }: { userId: string, subject: string, html?: string, text?: string }) {
    // 1. Check User Preference
    const user = await import('./prisma').then(m => m.prisma.user.findUnique({ where: { id: userId } }))

    if (!user) {
        console.warn(`[EMAIL SKIP] User ${userId} not found`)
        return { success: false, error: "User not found" }
    }

    if (!user.emailNotificationsEnabled) {
        console.log(`[EMAIL SKIP] User ${userId} has disabled notifications.`)
        return { success: false, skipped: true }
    }

    // 2. Send
    return await sendEmail({
        to: user.email,
        subject,
        html,
        text
    })
}
