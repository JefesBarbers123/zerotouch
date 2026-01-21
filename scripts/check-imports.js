
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking DB for Google Imports...");

    // Check Clients
    const clients = await prisma.client.findMany({
        where: { name: 'Google Calendar Import' },
        include: { _count: { select: { visits: true } } }
    });

    console.log(`Found ${clients.length} Imported Clients.`);
    clients.forEach(c => console.log(`- ID: ${c.id}, Mobile: ${c.mobile}, Visits: ${c._count.visits}, Created: ${c.createdAt}`));

    // Check Visits with Google Notes
    const visits = await prisma.visit.findMany({
        where: { notes: { contains: 'Synced from Google' } },
        take: 10,
        orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${visits.length} Google Visits (showing top 10).`);
    visits.forEach(v => console.log(`- Date: ${v.date}, Notes: ${v.notes}, ClientID: ${v.clientId}`));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
