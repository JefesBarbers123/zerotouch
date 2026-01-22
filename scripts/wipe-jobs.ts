
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Deleting all jobs...');
    // Delete applications and reports first due to foreign keys if cascade isn't set, 
    // but typically we just want to wipe jobs.
    // Let's try deleting jobs directly, assuming cascade or no related data yet.
    try {
        await prisma.jobApplication.deleteMany({});
        await prisma.jobReport.deleteMany({});
        const { count } = await prisma.job.deleteMany({});
        console.log(`Deleted ${count} jobs.`);
    } catch (e) {
        console.error(e);
    }
}

main();
