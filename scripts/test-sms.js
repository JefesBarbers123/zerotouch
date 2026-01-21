
// Usage: node scripts/test-sms.js <PHONE_NUMBER> <MESSAGE_BODY>
// Example: node scripts/test-sms.js +15550001 "Good experience"

async function testSMS() {
    const args = process.argv.slice(2)
    const from = args[0] || '+15550001'
    const body = args[1] || 'Good'

    console.log(`📱 Simulating SMS from ${from}: "${body}"`)

    try {
        const res = await fetch('http://localhost:3003/api/webhooks/sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                'From': from,
                'Body': body
            })
        })

        const text = await res.text()
        console.log("➡️ Response Status:", res.status)
        console.log("➡️ TwiML Response:\n", text)

        if (text.includes('<Message>')) {
            console.log("✅ Auto-reply generated!")
        } else {
            console.log("ℹ️ No auto-reply triggered (or silent).")
        }

    } catch (e) {
        console.error("❌ Error connecting to webhook. Is localhost:3003 running?", e.message)
    }
}

testSMS()
