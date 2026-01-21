const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const existing = await prisma.jobSource.findFirst({
            where: {
                type: 'ADZUNA'
            }
        });

        if (existing) {
            console.log('Adzuna source already exists:', existing.name);
            return;
        }

        console.log('Creating Adzuna source...');
        const source = await prisma.jobSource.create({
            data: {
                name: 'Adzuna API',
                type: 'ADZUNA',
                url: 'https://api.adzuna.com/v1/api/jobs', // Base URL, though adapter handles it
                isActive: true,
            }
        });
        console.log('Created Adzuna source:', source.id);
    } catch (error) {
        console.error('Error setup Adzuna source:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
