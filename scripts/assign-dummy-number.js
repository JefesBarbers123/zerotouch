const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const tenant = await prisma.tenant.findFirst()
    if (!tenant) {
        console.log("No tenant found!")
        return
    }

    await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
            twilioNumber: '+447911123456',
            twilioSid: 'PN_DUMMY_SID_123',
            phone: '+447700900000', // Default forwarding number
            smsAutoReplyMessage: "Sorry, I missed your call. Im cutting hair right now but Ill call you back in 5 mins!",
            smsAutoReplyEnabled: true,
            walletBalance: 100.00
        }
    })

    console.log(`✅ Assigned dummy number +447911123456 to tenant ${tenant.name}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
