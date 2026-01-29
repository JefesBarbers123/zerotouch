import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const scraper = await prisma.jobSource.findFirst({
        where: { type: 'SCRAPER' }
    });

    if (!scraper) {
        console.log("No SCRAPER source found.");
        return;
    }

    console.log(JSON.stringify(scraper, null, 2));

    // Check job count for this source
    const count = await prisma.job.count({
        where: { sourceId: scraper.id }
    });
    console.log(`Total jobs from this source: ${count}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
