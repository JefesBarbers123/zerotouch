
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // Get the first user/tenant
    const user = await prisma.user.findFirst({
        include: { tenant: true }
    })

    if (!user) return

    console.log(`Resetting number for Tenant: ${user.tenant.name} (${user.tenantId})`)

    await prisma.tenant.update({
        where: { id: user.tenantId },
        data: {
            twilioNumber: null,
            twilioSid: null
        }
    })

    console.log("Success! Number cleared.")
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
