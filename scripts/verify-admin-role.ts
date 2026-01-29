import { prisma } from '../src/lib/prisma';

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'askthejefe@gmail.com' },
        include: { tenant: true }
    });

    if (!user) {
        console.log('❌ User not found');
        return;
    }

    console.log('✅ User found:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Tenant: ${user.tenant.name}`);
    console.log(`   Subscription: ${user.tenant.subscriptionStatus}`);

    if (user.role === 'SUPER_ADMIN') {
        console.log('\n✅ User IS SUPER_ADMIN - sidebar should be visible');
    } else {
        console.log(`\n⚠️  User is ${user.role} - sidebar will NOT be visible`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
