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

export async function sendLimitReachedEmail(email: string, name: string) {
    const subject = "You've reached your daily limit!"
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1e3a8a;">Daily Limit Reached</h1>
            <p>Hi ${name},</p>
            <p>You have used your <strong>3 free job applications</strong> for today.</p>
            
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e3a8a;">Why Upgrade?</h3>
                <ul style="color: #4b5563;">
                    <li><strong>Unlimited</strong> Job Applications</li>
                    <li><strong>Priority</strong> Profile Visibility</li>
                    <li><strong>Smart Alerts</strong> for new jobs</li>
                    <li><strong>Direct Messaging</strong> with shops</li>
                </ul>
            </div>

            <p>Maximize your chances and unlock full access to the platform.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/upgrade" style="display: inline-block; background-color: #f59e0b; color: #1e3a8a; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase;">
                Upgrade Now
            </a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">
                The Zerotouches Team
            </p>
        </div>
    `
    return await sendEmail({ to: email, subject, html })
}
