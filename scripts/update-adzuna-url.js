const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const adzuna = await prisma.jobSource.findFirst({
            where: { type: 'ADZUNA' }
        });

        if (!adzuna) {
            console.log('Adzuna source not found to update.');
            return;
        }

        const newUrl = 'https://api.adzuna.com/v1/api/jobs/gb/search/1?what=barber';
        await prisma.jobSource.update({
            where: { id: adzuna.id },
            data: { url: newUrl }
        });

        console.log(`Updated Adzuna source URL to: ${newUrl}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
