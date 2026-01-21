
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { IngestionManager } from '@/lib/ingestion/manager';

// Force dynamic to ensure it runs every time and isn't cached
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout for serverless functions

const prisma = new PrismaClient();
const manager = new IngestionManager();

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sources = await prisma.jobSource.findMany({
            where: { isActive: true },
        });

        if (sources.length === 0) {
            return NextResponse.json({ message: 'No active sources found' });
        }

        const results = await Promise.allSettled(
            sources.map(source => manager.processSource(source.id))
        );

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failureCount = results.filter(r => r.status === 'rejected').length;

        return NextResponse.json({
            message: 'Ingestion complete',
            stats: {
                total: sources.length,
                success: successCount,
                failed: failureCount,
            }
        });

    } catch (error) {
        console.error('Ingestion Cron Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
