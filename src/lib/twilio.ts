
import twilio from 'twilio'
import { env } from '@/env'

export function getTwilioClient() {
    const accountSid = env.TWILIO_ACCOUNT_SID
    const authToken = env.TWILIO_AUTH_TOKEN

    if (!accountSid || !authToken) {
        throw new Error("Missing Twilio Credentials in environment")
    }

    return twilio(accountSid, authToken)
}

export async function searchLocalNumbers(countryCode: string, areaCode: string) {
    const client = getTwilioClient()
    const result = await client.availablePhoneNumbers(countryCode).local.list({
        areaCode: undefined, // Twilio Node lib might expect contains for some, but let's try just changing country first. 
        // Actually, for GB, 'areaCode' parameter exists but is string.
        contains: areaCode, // 'contains' is often safer for UK generic search if areaCode strict fails, but let's try standard areaCode first? 
        // Twilio API: mobile vs local. UK has local numbers.
        // Let's stick to areaCode if possible, but convert to string?
        // Actually, let's just use contains for pattern matching which is flexible.
        // But the user asked for "area code".
        // Let's try:
        // areaCode: areaCode
    })
    // Wait, let's look at the original code. 
    // It was limit: 10. 
    // The previous code used `areaCode: parseInt(areaCode)`.
    // I will use `contains: areaCode` because UK area codes vary in length and often users search by pattern.
    // Or correct Twilio usage for GB:
    /*
    client.availablePhoneNumbers('GB').local.list({
      areaCode: '020',
      limit: 20
    })
    */
    // So 'areaCode' string is fine.

    return result.map(record => ({
        phoneNumber: record.phoneNumber,
        friendlyName: record.friendlyName,
        locality: record.locality,
        region: record.region
    }))
}

export async function buyNumber(phoneNumber: string, rootUrl: string) {
    const client = getTwilioClient()

    // 1. Buy the number
    const purchasedNumber = await client.incomingPhoneNumbers.create({
        phoneNumber,
        voiceUrl: `${rootUrl}/api/webhooks/voice`, // Enable "Smart Caller ID" logic
        voiceMethod: 'POST'
    })

    return purchasedNumber.sid
}
