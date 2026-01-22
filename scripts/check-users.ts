
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, name: true, role: true, tenantId: true }
    });

    console.log("--- User Roles ---");
    users.forEach(u => {
        console.log(`[${u.role}] ${u.email} (${u.name}) - Tenant: ${u.tenantId}`);
    });

    await prisma.$disconnect();
}

main().catch(console.error);
export { }
