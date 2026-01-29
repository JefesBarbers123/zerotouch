
import { prisma } from '@/lib/prisma';
import SourceManager from './SourceManager';

// Force dynamic to ensure fresh data
export const dynamic = 'force-dynamic';

export default async function SourcesPage() {
    const sources = await prisma.jobSource.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="p-8 text-white min-h-screen bg-neutral-900">
            <header className="mb-8">
                <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Job Sources</h1>
                <p className="text-neutral-500 font-mono text-sm">Manage scraping targets and RSS feeds</p>
            </header>

            <SourceManager sources={sources} />
        </div>
    );
}
