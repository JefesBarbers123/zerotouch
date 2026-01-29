import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const sources = await prisma.jobSource.findMany();
    console.log("--- JOB SOURCES ---");
    for (const source of sources) {
        console.log(`[${source.type}] ${source.name}`);
        console.log(`  ID: ${source.id}`);
        console.log(`  Active: ${source.isActive}`);
        console.log(`  Last Checked: ${source.lastChecked}`);
        console.log(`  Last Status: ${source.lastStatus}`);
        console.log(`  Error: ${source.errorMsg}`);
        console.log(`  URL: ${source.url}`);
        console.log("-------------------");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
