
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Seeding At Risk Client...')

    // Find the first tenant/barber
    const user = await prisma.user.findFirst({ include: { tenant: true } })
    if (!user) throw new Error("No user found")

    // Create a Loyal Client who is Overdue
    const client = await prisma.client.create({
        data: {
            name: 'Mario Test (At Risk)',
            mobile: '555-0199',
            tenantId: user.tenantId,
            status: 'OVERDUE',
            lastVisitDate: new Date('2023-01-01'), // Long time ago
            visits: {
                create: [
                    // 3 historic visits to prove loyalty
                    { date: new Date('2022-10-01'), tenantId: user.tenantId, barberId: user.id, serviceId: (await prisma.service.findFirst()).id },
                    { date: new Date('2022-11-01'), tenantId: user.tenantId, barberId: user.id, serviceId: (await prisma.service.findFirst()).id },
                    { date: new Date('2022-12-01'), tenantId: user.tenantId, barberId: user.id, serviceId: (await prisma.service.findFirst()).id },
                ]
            }
        }
    })

    console.log(`Created At Risk Client: ${client.name}`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
