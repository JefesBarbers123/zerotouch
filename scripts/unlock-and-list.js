
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        include: { tenant: true }
    })

    console.log("Current Users:")
    users.forEach(u => {
        console.log(`- ${u.name} (${u.email}) Role: ${u.role} | Tenant: ${u.tenant.name} (${u.tenant.subscriptionStatus})`)
    })

    // Update all tenants to ACTIVE for dev purposes if requested "dummy account"
    // Assuming the first one or all of them.
    console.log("\nUnlocking all tenants for dev...")
    await prisma.tenant.updateMany({
        data: {
            subscriptionStatus: 'ACTIVE',
            walletBalance: 100.00 // Give them some cash too
        }
    })
    console.log("All tenants updated to ACTIVE with £100 credit.")
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
