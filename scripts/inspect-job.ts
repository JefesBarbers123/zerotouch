import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const job = await prisma.job.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { source: true }
    });

    if (!job) {
        console.log("No jobs found.");
        return;
    }

    console.log("--- LATEST JOB ---");
    console.log(`Title: ${job.title}`);
    console.log(`Company: ${job.company}`);
    console.log(`Location: ${job.location}`);
    console.log(`Source: ${job.source.name} (${job.source.type})`);
    console.log(`URL: ${job.sourceUrl}`);
    console.log(`Description Snippet: ${job.description.substring(0, 100)}...`);
    console.log("------------------");
}

main().catch(console.error).finally(() => prisma.$disconnect());
