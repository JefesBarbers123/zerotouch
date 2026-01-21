// This script mimics the POST request Twilio sends to the webhook.
// It requires the server to be running, or we can just send the request to a local URL if we want to confirm the logic visually or via logs.
// However, since we can't easily see the server logs if we run it in background without 'read_terminal', 
// we'll just print what we *would* send and what we expect. 
// Actually, I can use 'fetch' to hit the running dev server.

const fetch = require('node-fetch'); // Might need to install or use native fetch in node 18+

async function testWebhook() {
    const params = new URLSearchParams();
    params.append('From', '+15551234567'); // Caller
    params.append('To', '+44000000000');
    params.append('Body', 'This service was Bad'); // Trigger Bad Feedback
    params.append('CallSid', 'CA12345');

    console.log("Sending Mock Webhook Request...");
    const http = require('http');
    const postData = params.toString();

    const options = {
        hostname: 'localhost',
        port: 3003,
        path: '/api/webhooks/sms',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log("\n--- Response TwiML ---");
            console.log(data);
        });
    });

    req.on('error', (e) => {
        console.error("Webhook Test Failed (Is server running?):", e.message);
    });

    req.write(postData);
    req.end();
}

// Check node version for fetch support or warn
if (Number(process.versions.node.split('.')[0]) < 18) {
    console.log("Node version < 18, utilizing 'node-fetch' if available or skipping.");
}

testWebhook();
