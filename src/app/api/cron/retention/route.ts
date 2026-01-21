import { NextResponse } from 'next/server'
import { runDailyRetentionJob } from '@/lib/retention'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const result = await runDailyRetentionJob()
        return NextResponse.json({ success: true, result })
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        return NextResponse.json({ success: false, error: 'Failed to run retention job' }, { status: 500 })
    }
}
