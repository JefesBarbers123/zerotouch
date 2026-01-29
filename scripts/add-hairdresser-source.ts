
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Adding 'Hairdresser' Source for Adzuna UK...")

    // Adzuna URL for Hairdresser
    const sourceUrl = "https://api.adzuna.com/v1/api/jobs/gb/search/1?what=hairdresser&results_per_page=50&content-type=application/json"

    const existing = await prisma.jobSource.findFirst({
        where: { url: sourceUrl }
    })

    if (existing) {
        console.log("Source already exists.")
    } else {
        await prisma.jobSource.create({
            data: {
                name: "Adzuna UK (Hairdresser)",
                type: "ADZUNA",
                url: sourceUrl,
                isActive: true
            }
        })
        console.log("✅ Added Adzuna UK (Hairdresser) Source.")
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
