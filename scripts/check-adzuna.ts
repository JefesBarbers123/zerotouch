
const { PrismaClient } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();
    console.log("--- Adzuna Configuration Check ---");

    // 1. Check Env Vars
    const hasId = !!process.env.ADZUNA_APP_ID;
    const hasKey = !!process.env.ADZUNA_APP_KEY;

    console.log(`ADZUNA_APP_ID: ${hasId ? '✅ Present' : '❌ Missing'}`);
    console.log(`ADZUNA_APP_KEY: ${hasKey ? '✅ Present' : '❌ Missing'}`);

    if (!hasId || !hasKey) {
        console.log("\n⚠️  You need to add these keys to your .env file.");
    }

    // 2. Check DB Source
    const source = await prisma.jobSource.findFirst({ where: { type: 'ADZUNA' } });
    if (source) {
        console.log(`\nAdzuna Source Status: ${source.isActive ? '✅ Active' : '❌ Inactive'}`);
        console.log(`Last Checked: ${source.lastChecked ? source.lastChecked.toLocaleString() : 'Never'}`);
        if (!source.isActive) {
            console.log("Action: Enable this source in Admin > Job Sources, or I can enable it for you now.");
        }
    } else {
        console.log("\nAdzuna Source: ❌ Not found in DB (Script should have added it)");
    }

    await prisma.$disconnect();
}

main().catch(console.error);
export { } 
