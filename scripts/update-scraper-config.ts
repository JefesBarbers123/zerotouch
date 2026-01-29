import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Correct selectors for trabajo.org
    const selectors = {
        container: '.nf-job',
        title: 'h2 a',
        company: '.nf-job-list-info span:nth-child(2)', // Company is 2nd span
        location: '.nf-job-list-info span:nth-child(1)', // Location is 1st span
        description: '.nf-job-list-desc', // Get the whole desc block text
        date: '.text-muted small',
        // link is handled by scraper adapter finding 'a' inside title usually, 
        // but scraper.ts implementation finds 'a' anywhere in container?
        // Let's check scraper.ts logic: 
        // const link = $(el).find('a').attr('href');
        // This is naive. It finds the first link.
        // In .nf-job, the first link is likely the logo or title.
        // Title is inside h2 > a.
        // Logo is div.logo-bus-tr > img. No link wrapper?
        // Line 148: <div class="logo-bus-tr mr-3"><img ...></div>. No link.
        // Line 151: <h2 ...><a href="...">...</a></h2>. This is the first link!
        // So default behavior is correct.
    };

    const scraper = await prisma.jobSource.findFirst({
        where: { type: 'SCRAPER' }
    });

    if (!scraper) {
        console.error("No SCRAPER found");
        return;
    }

    console.log(`Updating scraper ${scraper.name} with new selectors...`);
    await prisma.jobSource.update({
        where: { id: scraper.id },
        data: {
            selectors: selectors as any // JSON type
        }
    });

    console.log("Update complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
