import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'askthejefe@gmail.com';
    const user = await prisma.user.findUnique({
        where: { email },
        include: { tenant: true }
    });

    if (user) {
        console.log(`User: ${user.name} (${user.email})`);
        console.log(`Role: ${user.role}`);
        console.log(`Tenant Subscription: ${user.tenant.subscriptionStatus}`);
    } else {
        console.log("User not found");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
