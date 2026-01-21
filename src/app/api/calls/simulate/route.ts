
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: Request) {
    const user = await getCurrentUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { from } = body

    // 1. Find or create dummy client for simulation
    let client = await prisma.client.findFirst({
        where: { mobile: from, tenantId: user.tenantId }
    })

    if (!client) {
        // Create demo client "Mario Test"
        client = await prisma.client.create({
            data: {
                name: 'Mario Test (Simulated)',
                mobile: from,
                tenantId: user.tenantId,
                status: 'AT_RISK',
                lastVisitDate: new Date('2023-12-01') // Long ago
            }
        })
    }

    // 2. Create Active Call Log
    const call = await prisma.callLog.create({
        data: {
            tenantId: user.tenantId,
            from: from,
            to: 'SHOP_NUMBER',
            status: 'RINGING',
            clientName: client.name
        }
    })

    // 3. Auto-hangup after 10 seconds (optional cleanup for demo)
    setTimeout(async () => {
        // This is simplified; in production we use webhooks
        // But for simulation, we let the frontend or user "answer"
    }, 10000)

    return NextResponse.json({ success: true, callId: call.id })
}
