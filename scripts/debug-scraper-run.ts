import { IngestionManager } from '../src/lib/ingestion/manager';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const manager = new IngestionManager();

async function main() {
    const scraper = await prisma.jobSource.findFirst({
        where: { type: 'SCRAPER' }
    });

    if (!scraper) {
        console.error("No SCRAPER found");
        return;
    }

    console.log(`Running scraper for: ${scraper.name} (${scraper.url})`);
    console.log(`Selectors:`, scraper.selectors);

    await manager.processSource(scraper.id);

    // Check results
    const count = await prisma.job.count({
        where: { sourceId: scraper.id }
    });
    console.log(`Job count after run: ${count}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
