
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log("--- Configuring Adzuna for UK Barber Jobs ---")

    const sourceUrl = "https://api.adzuna.com/v1/api/jobs/gb/search/1?what=barber&results_per_page=50&content-type=application/json"

    const source = await prisma.jobSource.upsert({
        where: { url: sourceUrl }, // We use URL as a unique key often, but schema might not enforce it on URL alone if it's not unique. Let's check schema/model.
        // Schema: sourceUrl is NOT unique on JobSource model. `id` is PK. 
        // We should search by name + type first to avoid duplicates if possible, or just create if not exists.
        // Actually, let's look for existing ADZUNA source.
        create: {
            name: "Adzuna UK (Barber)",
            type: "ADZUNA",
            url: sourceUrl,
            isActive: true,
        },
        update: {
            name: "Adzuna UK (Barber)",
            isActive: true,
            url: sourceUrl, // Ensure URL is correct
        }
    })

    // Since upsert requires a unique where, and we don't have one on URL/Type, we might need findFirst then update/create.
    // Let's refine this to be safe.
}

async function safeUpsert() {
    console.log("--- Configuring Adzuna for UK Barber Jobs ---")
    const sourceUrl = "https://api.adzuna.com/v1/api/jobs/gb/search/1?what=barber&results_per_page=50&content-type=application/json"

    // Check if exists
    const existing = await prisma.jobSource.findFirst({
        where: {
            type: 'ADZUNA',
            url: { contains: 'adzuna.com' } // Simple check
        }
    })

    if (existing) {
        console.log(`Found existing Adzuna source (${existing.id}). Updating...`)
        await prisma.jobSource.update({
            where: { id: existing.id },
            data: {
                name: "Adzuna UK (Barber)",
                url: sourceUrl,
                isActive: true
            }
        })
        console.log("✅ Updated Adzuna Source.")
    } else {
        console.log("Creating new Adzuna Source...")
        await prisma.jobSource.create({
            data: {
                name: "Adzuna UK (Barber)",
                type: "ADZUNA",
                url: sourceUrl,
                isActive: true
            }
        })
        console.log("✅ Created Adzuna Source.")
    }
}

safeUpsert()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
