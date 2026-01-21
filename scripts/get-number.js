
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const tenant = await prisma.tenant.findFirst({
            where: {
                twilioNumber: { not: null }
            }
        })
        if (tenant && tenant.twilioNumber) {
            console.log("FOUND_NUMBER:", tenant.twilioNumber)
        } else {
            console.log("NO_NUMBER_FOUND")
        }
    } catch (e) {
        console.error("ERROR:", e.message)
    } finally {
        await prisma.$disconnect()
    }
}

main()
