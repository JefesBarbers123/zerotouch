
const { IngestionManager } = require('../src/lib/ingestion/manager');
const { PrismaClient } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();
    const manager = new IngestionManager();
    console.log("Starting Manual Ingestion...");

    // 1. Ensure Indeed RSS exists
    const indeedUrl = "https://uk.indeed.com/rss?q=barber&l=United+Kingdom";
    const existing = await prisma.jobSource.findFirst({ where: { url: indeedUrl } });

    if (!existing) {
        console.log("Adding Indeed UK RSS Source...");
        await prisma.jobSource.create({
            data: {
                name: "Indeed UK (RSS)",
                type: "RSS",
                url: indeedUrl,
                isActive: true
            }
        });
    }

    // 2. Ensure Adzuna source exists
    const adzunaUrl = "https://api.adzuna.com/v1/api/jobs/gb/search/1?what=barber";
    const adzuna = await prisma.jobSource.findFirst({ where: { type: 'ADZUNA' } });
    if (!adzuna) {
        console.log("Adding Adzuna UK Source (Inactive - Requires Keys)...");
        await prisma.jobSource.create({
            data: {
                name: "Adzuna UK",
                type: "ADZUNA",
                url: adzunaUrl,
                isActive: false // User must enable after keys
            }
        });
    }

    // 2. Run Ingestion for all active sources
    const sources = await prisma.jobSource.findMany({ where: { isActive: true } });
    console.log(`Found ${sources.length} active sources.`);

    for (const source of sources) {
        console.log(`Processing: ${source.name} (${source.type})...`);
        await manager.processSource(source.id);
    }

    console.log("Ingestion Complete.");
    await prisma.$disconnect();
}

main().catch(console.error);
export { }
