
import { prisma } from '../src/lib/prisma';

async function main() {
    console.log("Inspecting Scraper Jobs for Uniformity...");
    const scraper = await prisma.jobSource.findFirst({
        where: { type: 'SCRAPER' }
    });

    if (!scraper) {
        console.log("No scraper source found.");
        return;
    }

    const jobs = await prisma.job.findMany({
        where: { sourceId: scraper.id },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    console.log(`Found ${jobs.length} jobs.`);

    jobs.forEach((j, i) => {
        console.log(`\n--- Job ${i + 1} ---`);
        console.log(`Title: "${j.title}"`);
        console.log(`Company: "${j.company}"`);
        console.log(`Location: "${j.location}"`);
        console.log(`Date: "${j.postedDate}"`);
        // console.log(`Desc Preview: "${j.description.substring(0, 50)}..."`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
