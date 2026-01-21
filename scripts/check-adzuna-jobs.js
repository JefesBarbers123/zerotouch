const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
    let output = '';
    const log = (msg) => { output += msg + '\n'; console.log(msg); };

    const adzunaSource = await prisma.jobSource.findFirst({
        where: { type: 'ADZUNA' }
    });

    if (!adzunaSource) {
        log('Adzuna source not found!');
    } else {
        log(`Found Adzuna Source: ${adzunaSource.name} (${adzunaSource.id})`);

        const count = await prisma.job.count({
            where: { sourceId: adzunaSource.id }
        });
        log(`Total Adzuna Jobs: ${count}`);

        const jobs = await prisma.job.findMany({
            where: { sourceId: adzunaSource.id },
            take: 5,
            orderBy: { postedDate: 'desc' }
        });

        jobs.forEach(j => {
            log(`- ${j.title} @ ${j.company} [${j.location}] (Salary: ${j.salaryMin}-${j.salaryMax} ${j.currency})`);
        });
    }

    fs.writeFileSync('check_adzuna_output.txt', output);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
