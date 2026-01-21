
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
    const user = await getCurrentUser()
    if (!user) {
        return NextResponse.json({ activeCall: null })
    }

    // Find any call created in the last 15 seconds that is RINGING
    const activeCall = await prisma.callLog.findFirst({
        where: {
            tenantId: user.tenantId,
            status: 'RINGING',
            createdAt: {
                gte: new Date(Date.now() - 15000) // 15s timeout
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ activeCall })
}
