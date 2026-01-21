
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, tenant: { select: { name: true } } }
    });

    let output = "--- USERS FOUND ---\n";
    users.forEach(u => {
        output += `[${u.role}] ${u.name} (${u.email}) - Shop: ${u.tenant?.name}\n`;
    });
    output += "-------------------\n";

    fs.writeFileSync('users_dump.txt', output);
    console.log("Dumped to users_dump.txt");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
