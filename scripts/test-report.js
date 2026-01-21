
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Testing Job Report Creation...");

    // 1. Get a job
    const job = await prisma.job.findFirst();
    if (!job) {
        console.log("No jobs found to report.");
        return;
    }
    console.log(`Reporting Job: ${job.id} (${job.title})`);

    // 2. Create Report
    try {
        const report = await prisma.jobReport.create({
            data: {
                jobId: job.id,
                reason: "Test Report from Script"
            }
        });
        console.log("Report created successfully:", report);
    } catch (e) {
        console.error("Failed to create report:", e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
