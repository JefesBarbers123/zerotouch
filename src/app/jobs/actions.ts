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
