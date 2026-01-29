import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'askthejefe@gmail.com';
    console.log(`Granting SUPER_ADMIN access to ${email}...`);

    const user = await prisma.user.update({
        where: { email },
        data: { role: 'SUPER_ADMIN' }
    });

    console.log(`Updated user ${user.name} to ${user.role}.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
