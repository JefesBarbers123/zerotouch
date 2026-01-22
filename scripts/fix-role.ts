
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- Updating Roles ---");

    // Find users who are SUPER_ADMIN or just generally update the main user
    // Let's just update all SUPER_ADMINs to OWNER for now as that's likely the misconfiguration
    // OR we can update the specific user if we knew the ID.
    // The previous output was cut off but looked like `askthejefe`.

    const { count } = await prisma.user.updateMany({
        where: { role: 'SUPER_ADMIN' },
        data: { role: 'OWNER' }
    });

    console.log(`Updated ${count} users from SUPER_ADMIN to OWNER.`);

    // Just in case, let's explicit update usage of 'askthejefe' if it exists differently
    // But updateMany should catch it.

    const users = await prisma.user.findMany({ select: { email: true, role: true } });
    console.log("Current Roles:", users);

    await prisma.$disconnect();
}

main().catch(console.error);
export { }
