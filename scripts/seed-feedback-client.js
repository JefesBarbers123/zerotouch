
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Client for Feedback Test...");

    // 1. Ensure Tenant Exists
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
        tenant = await prisma.tenant.create({
            data: {
                name: "Test Tenant",
                subscriptionStatus: "FREE"
            }
        });
        console.log("Created Tenant:", tenant.id);
    }

    // 2. Ensure Client Exists
    const mobile = '+15551234567';
    let client = await prisma.client.findFirst({ where: { mobile } });

    if (!client) {
        client = await prisma.client.create({
            data: {
                name: "Test Client",
                mobile,
                tenantId: tenant.id,
                smsFeedbackStatus: "WAITING_RATING"
            }
        });
        console.log("Created Client:", client.id);
    } else {
        // Reset status
        await prisma.client.update({
            where: { id: client.id },
            data: { smsFeedbackStatus: "WAITING_RATING" }
        });
        console.log("Updated Client Status to WAITING_RATING:", client.id);
    }

    // 3. Ensure Tenant has an Owner (for email test)
    const ownerEmail = "test-owner@example.com";
    let owner = await prisma.user.findUnique({ where: { email: ownerEmail } });
    if (!owner) {
        await prisma.user.create({
            data: {
                email: ownerEmail,
                name: "Test Owner",
                role: "OWNER",
                tenantId: tenant.id
            }
        });
        console.log("Created Owner for Email Notification Test");
    }

    console.log("Seed Complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
