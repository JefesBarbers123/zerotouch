'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function reportJob(jobId: string, reason: string) {
    if (!jobId || !reason) {
        return { success: false, error: "Missing required fields" }
    }

    try {
        await prisma.jobReport.create({
            data: {
                jobId,
                reason
            }
        })
        return { success: true }
    } catch (e) {
        console.error("Failed to report job:", e)
        return { success: false, error: "Failed to submit report" }
    }
}

export async function applyToJob(jobId: string, sourceUrl: string) {
    const { getCurrentUser } = await import('@/lib/auth')
    const user = await getCurrentUser()

    if (!user) {
        throw new Error("UNAUTHORIZED_LOGIN_REQUIRED")
    }

    // Check if applied before (optional, but good UX to not count dups)
    const existing = await prisma.jobApplication.findFirst({
        where: {
            userId: user.id,
            jobId: jobId
        }
    })

    if (existing) {
        // Already tracked, just let them go
        return { success: true, url: sourceUrl }
    }

    // Check Daily Limit for FREE users
    const isFree = user.tenant.subscriptionStatus !== 'ACTIVE'

    if (isFree) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const count = await prisma.jobApplication.count({
            where: {
                userId: user.id,
                createdAt: { gte: today }
            }
        })

        if (count >= 3) {
            // Send Email Notification (Async/Fire-and-forget to not block response too much, or await)
            const { sendLimitReachedEmail } = await import('@/lib/email')
            await sendLimitReachedEmail(user.email, user.name || 'User') // await to ensure it sends before throwing error? Or let it fail silently? best to await here.

            throw new Error("LIMIT_REACHED")
        }
    }

    // Log Application
    await prisma.jobApplication.create({
        data: {
            userId: user.id,
            jobId: jobId
        }
    })

    // SEND NOTIFICATION TO COMPANY (If email exists)
    // 1. Fetch Job
    const job = await prisma.job.findUnique({
        where: { id: jobId }
    })

    if (job?.contactEmail) {
        const { sendEmail } = await import('@/lib/email')
        await sendEmail({
            to: job.contactEmail,
            subject: `New Application: ${job.title} - ${user.name}`,
            html: `
                <h2>New Applicant via Zerotouches</h2>
                <p>Hello,</p>
                <p><strong>${user.name}</strong> has expressed interest in your position: <strong>${job.title}</strong>.</p>
                <p>Applicant Email: ${user.email}</p>
                <p>User Profile: <a href="${process.env.NEXT_PUBLIC_APP_URL}/barber/${user.id}">View Profile</a></p>
                <br/>
                <p>Best regards,<br/>The Zerotouches Team</p>
            `
        })
    }

    return { success: true, url: sourceUrl }
}
