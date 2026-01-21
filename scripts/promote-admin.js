
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'askthejefe@gmail.com';
    console.log(`Promoting ${email} to SUPER_ADMIN...`);

    const user = await prisma.user.update({
        where: { email },
        data: { role: 'SUPER_ADMIN' }
    });

    console.log(`Success! ${user.name} is now ${user.role}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
