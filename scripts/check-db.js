
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Integration Table...");
    try {
        const count = await prisma.integration.count();
        console.log(`Integration Table Exists. Count: ${count}`);
    } catch (e) {
        console.error("Integration Table check failed (Migration needed?):", e.message);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
