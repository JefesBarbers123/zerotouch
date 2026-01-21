
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { name: { contains: 'Jerelle' } },
                { name: { contains: 'Obina' } },
                { name: { contains: 'Okoro' } },
                { email: { contains: 'askthejefe@gmail.com' } } // Also check the admin email
            ]
        },
        include: { tenant: true }
    });
    console.log(JSON.stringify(users, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
