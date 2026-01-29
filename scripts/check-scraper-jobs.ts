
import { prisma } from '../src/lib/prisma';

async function main() {
    console.log("Checking Scraper Source...");
    const scraper = await prisma.jobSource.findFirst({
        where: { type: 'SCRAPER' }
    });

    if (!scraper) {
        console.log("No scraper source found.");
        return;
    }

    console.log(`Source: ${scraper.name} (ID: ${scraper.id})`);
    console.log(`URL: ${scraper.url}`);
    console.log(`Last Checked: ${scraper.lastChecked}`);
    console.log(`Last Status: ${scraper.lastStatus}`);
    console.log(`Error Msg: ${scraper.errorMsg}`);
    console.log(`Selectors: ${JSON.stringify(scraper.selectors, null, 2)}`);

    console.log("\nLatest 5 Jobs:");
    const jobs = await prisma.job.findMany({
        where: { sourceId: scraper.id },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    if (jobs.length === 0) {
        console.log("No jobs found for this source.");
    } else {
        jobs.forEach(j => {
            console.log(`- [${j.createdAt.toISOString()}] ${j.title} @ ${j.company} (${j.location})`);
            console.log(`  slug: ${j.slug}`);
            console.log(`  Source URL: ${j.sourceUrl}`);
        });
    }

    const total = await prisma.job.count({ where: { sourceId: scraper.id } });
    console.log(`\nTotal Jobs: ${total}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
