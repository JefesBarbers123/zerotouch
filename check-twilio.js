
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

async function main() {
    try {
        console.log("Checking Credentials...");
        const account = await client.api.v2010.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
        console.log("--- Account Details ---");
        console.log(`Name: ${account.friendlyName}`);
        console.log(`Status: ${account.status}`);
        console.log(`Type: ${account.type}`); // Trial or Full
        console.log("-----------------------");

        if (account.type === 'Trial') {
            console.log("WARNING: Trial accounts have restrictions on buying numbers.");
        } else {
            console.log("Account is Full (Upgraded).");
        }

        // Try to list incoming numbers to see if we hit a limit
        const incoming = await client.incomingPhoneNumbers.list({ limit: 5 });
        console.log(`Existing Numbers: ${incoming.length}`);

    } catch (e) {
        console.error("Error connecting to Twilio:");
        console.error(e.message);
    }
}

main();
