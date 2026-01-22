
const { PrismaClient } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();
    const count = await prisma.job.count();
    console.log(`Total Jobs: ${count}`);
    const jobs = await prisma.job.findMany({ take: 3 });
    console.log(jobs);
    await prisma.$disconnect();
}

main().catch(console.error);
export { }
