import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'askthejefe@gmail.com';
    console.log(`Granting FULL access to ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: { tenant: true }
    });

    if (!user) {
        console.error("User not found!");
        return;
    }

    console.log(`Current Status: ${user.tenant.subscriptionStatus}`);

    await prisma.tenant.update({
        where: { id: user.tenantId },
        data: {
            subscriptionStatus: 'ACTIVE',
            // Also reset search count if needed?
            jobSearchCount: 0
        }
    });

    console.log("Updated to ACTIVE.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
