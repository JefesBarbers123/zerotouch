'use server'

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { getCurrentUser } from '@/lib/auth'

export async function submitSupportRequest(formData: FormData) {
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    // Optional: User might not be logged in if this is public help, 
    // but typically help is inside the app. Let's assume user.
    const user = await getCurrentUser()
    const email = user?.email || formData.get('email') as string || 'anonymous@zerotouches.com'

    if (!subject || !message) {
        return { success: false, error: "Missing fields" }
    }

    try {
        // 1. Save to DB
        const ticket = await prisma.supportTicket.create({
            data: {
                userId: user?.id,
                email,
                subject,
                message
            }
        })

        // 2. Send Notifications

        // A. To Admin Dashboard Owner (Jefe)
        // Check if admin email is set, otherwise default
        const adminEmail = process.env.ADMIN_EMAIL || 'askthejefe@gmail.com'

        await sendEmail({
            to: adminEmail,
            subject: `[Support] ${subject}`,
            html: `
                <h1>New Support Ticket</h1>
                <p><strong>From:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <blockquote style="border-left: 2px solid #ccc; padding-left: 10px; margin: 10px 0;">
                    ${message}
                </blockquote>
                <p><a href="${process.env.NEXT_PUBLIC_URL}/admin/super">View in Dashboard</a></p>
            `
        })

        // B. To User (Confirmation) - Only if real email
        if (email && email.includes('@')) {
            await sendEmail({
                to: email,
                subject: `Support Request Received: ${subject}`,
                html: `
                    <p>Hi there,</p>
                    <p>We received your support request. Our team will get back to you shortly.</p>
                    <p><strong>Your Message:</strong></p>
                    <p>${message}</p>
                `
            })
        }

        return { success: true }
    } catch (e) {
        console.error("Failed to submit ticket:", e)
        return { success: false, error: "Failed to send request" }
    }
}
