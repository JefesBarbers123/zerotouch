
const twilio = require('twilio');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

// Load env
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) process.env[k] = envConfig[k];
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const prisma = new PrismaClient();

async function main() {
    // 1. Get Tenant Number
    const tenant = await prisma.tenant.findFirst({
        where: { NOT: { twilioSid: null } }
    });

    if (!tenant || !tenant.twilioSid) {
        console.log("❌ No active Twilio number found for this tenant.");
        return;
    }

    const publicUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (publicUrl.includes('localhost')) {
        console.log("❌ NEXT_PUBLIC_APP_URL is still set to localhost. Please update .env with your Ngrok URL first.");
        return;
    }

    console.log(`Updating Webhook for ${tenant.twilioNumber} (${tenant.twilioSid})`);
    console.log(`New Voice URL: ${publicUrl}/api/webhooks/voice`);

    try {
        await client.incomingPhoneNumbers(tenant.twilioSid)
            .update({
                voiceUrl: `${publicUrl}/api/webhooks/voice`,
                voiceMethod: 'POST'
            });
        console.log("✅ Success! Webhook updated.");
    } catch (e) {
        console.error("Error updating Twilio:", e.message);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
