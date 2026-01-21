// Standalone test script for Twilio Search
// Actually, since the project is TS, running a JS script importing TS files is tricky without ts-node. 
// Easier to make a standalone test script that copies the logic or uses the 'twilio' package directly.

const twilio = require('twilio');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) process.env[k] = envConfig[k];
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function testSearch() {
    console.log("--- Testing UK Search (London 020) ---");
    try {
        const ukResults = await client.availablePhoneNumbers('GB').local.list({
            contains: '20',
            limit: 3
        });
        ukResults.forEach(n => console.log(`🇬🇧 ${n.friendlyName} (${n.locality})`));
    } catch (e) {
        console.error("UK Search Failed:", e.message);
    }

    console.log("\n--- Testing US Search (NYC 212) ---");
    try {
        const usResults = await client.availablePhoneNumbers('US').local.list({
            areaCode: '212',
            limit: 3
        });
        usResults.forEach(n => console.log(`🇺🇸 ${n.friendlyName} (${n.region})`));
    } catch (e) {
        console.error("US Search Failed:", e.message);
    }
}

testSearch();
