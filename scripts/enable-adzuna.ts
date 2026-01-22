
const { PrismaClient } = require('@prisma/client');
const { IngestionManager } = require('../src/lib/ingestion/manager');

async function main() {
    const prisma = new PrismaClient();
    const manager = new IngestionManager();
    console.log("--- Activating Adzuna ---");

    const adzuna = await prisma.jobSource.findFirst({ where: { type: 'ADZUNA' } });
    if (!adzuna) {
        console.error("Adzuna source not found!");
        return;
    }

    if (!adzuna.isActive) {
        console.log(`Enabling ${adzuna.name}...`);
        await prisma.jobSource.update({
            where: { id: adzuna.id },
            data: { isActive: true }
        });
        console.log("✅ Adzuna Enabled.");
    } else {
        console.log("✅ Adzuna is already active.");
    }

    console.log("Running Ingestion Now...");
    await manager.processSource(adzuna.id);
    console.log("Ingestion Complete.");
    await prisma.$disconnect();
}

main().catch(console.error);
export { } // Isolate module
