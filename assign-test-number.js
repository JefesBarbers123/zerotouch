
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // Get the first user/tenant
    const user = await prisma.user.findFirst({
        include: { tenant: true }
    })

    if (!user) {
        console.log("No user found.")
        return
    }

    console.log(`Assigning number to Tenant: ${user.tenant.name} (${user.tenantId})`)

    // Manually update tenant with a fake UK number
    await prisma.tenant.update({
        where: { id: user.tenantId },
        data: {
            twilioNumber: '+442079460123', // UK Drama Number (Ofcom reserved)
            twilioSid: 'PN_MANUAL_TEST_SID'
        }
    })

    console.log("Success! Assigned +442079460123. Refresh the Settings page.")
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
