
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const key = searchParams.get('key')

        if (key !== process.env.CRON_SECRET) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))

        // 1. Expire jobs past expiryDate
        const expiryDateUpdate = await prisma.job.updateMany({
            where: {
                isPublished: true,
                expiryDate: { lt: now }
            },
            data: { isPublished: false }
        })

        // 2. Expire old jobs with no expiryDate
        const oldJobUpdate = await prisma.job.updateMany({
            where: {
                isPublished: true,
                expiryDate: null,
                postedDate: { lt: thirtyDaysAgo }
            },
            data: { isPublished: false }
        })

        const count = expiryDateUpdate.count + oldJobUpdate.count

        console.log(`[CRON] Expiry Sync: Archived ${count} jobs.`)
        return NextResponse.json({ success: true, archived: count })

    } catch (e) {
        console.error("[CRON] Expiry Failed:", e)
        return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
    }
}
