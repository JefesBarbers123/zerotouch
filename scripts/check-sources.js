const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const sources = await prisma.jobSource.findMany();
        console.log('--- Job Sources ---');
        if (sources.length === 0) {
            console.log('No sources found.');
        } else {
            sources.forEach(s => {
                console.log(`ID: ${s.id} | Name: ${s.name} | Type: ${s.type} | Enabled: ${s.enabled}`);
            });
        }
    } catch (error) {
        console.error('Error fetching sources:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
