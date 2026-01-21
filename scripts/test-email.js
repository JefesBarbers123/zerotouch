
const { Resend } = require('resend');

// Mock env if not set (but we know it's in .env)
// Actually we need to load .env manually if running via node directly without -r dotenv/config
// But let's assume we can paste the key or require dotenv.

require('dotenv').config();

const resendApiKey = process.env.RESEND_API_KEY;

console.log("Testing Email with Key:", resendApiKey ? "FOUND" : "MISSING");

async function main() {
    if (!resendApiKey) throw new Error("No API Key");

    const resend = new Resend(resendApiKey);

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'served@resend.dev', // Default "safe" address for testing
            subject: 'Test Email from Script',
            html: '<p>It works!</p>'
        });

        if (error) {
            console.error("Resend Error:", error);
        } else {
            console.log("Email Sent! ID:", data.id);
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

main();
