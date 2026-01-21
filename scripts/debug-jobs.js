
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fs = require('fs');

async function main() {
    let output = '';
    const log = (msg) => { output += msg + '\n'; console.log(msg); };

    log('--- Job Sources ---');
    const sources = await prisma.jobSource.findMany();
    if (sources.length === 0) {
        log('No sources found.');
    } else {
        sources.forEach(s => {
            log(`[${s.id}] ${s.name} (${s.type}) - Active: ${s.isActive} | Last Status: ${s.lastStatus} | Error: ${s.errorMsg}`);
        });
    }

    log('\n--- Jobs (Last 20) ---');
    const count = await prisma.job.count();
    log(`Total Jobs: ${count}`);

    const jobs = await prisma.job.findMany({
        take: 20,
        include: { source: true },
        orderBy: { postedDate: 'desc' }
    });

    jobs.forEach(j => {
        log(`- [${j.source.name}] ${j.title} @ ${j.company} (ID: ${j.id})`);
    });

    fs.writeFileSync('debug_jobs_output.txt', output);
    console.log('Output written to debug_jobs_output.txt');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
