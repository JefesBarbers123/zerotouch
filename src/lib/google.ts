
import { google } from 'googleapis'
import { env } from '@/env'

const SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly',
    'https://www.googleapis.com/auth/contacts.readonly'
]

export function getOAuthClient() {
    const clientId = env.GOOGLE_CLIENT_ID
    const clientSecret = env.GOOGLE_CLIENT_SECRET
    const redirectUri = env.GOOGLE_REDIRECT_URI || `${env.NEXT_PUBLIC_APP_URL}/settings/integrations/callback`

    if (process.env.NODE_ENV === 'development') {
        console.log({
            clientId: !!clientId,
            clientSecret: !!clientSecret,
            redirectUri
        })
    }

    if (!clientId || !clientSecret) {
        throw new Error("Missing Google Credentials in .env")
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export function getAuthUrl() {
    const oauth2Client = getOAuthClient()
    return oauth2Client.generateAuthUrl({
        access_type: 'offline', // Critical for refresh token
        scope: SCOPES,
        prompt: 'consent' // Force refresh token generation
    })
}

export async function getTokens(code: string) {
    const oauth2Client = getOAuthClient()
    const { tokens } = await oauth2Client.getToken(code)
    return tokens
}

export async function listEvents(accessToken: string, refreshToken: string | undefined | null) {
    const oauth2Client = getOAuthClient()
    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken || undefined
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Fetch events from Primary calendar (Looking back 1 day, forward 1 month)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)

    const nextMonth = new Date(now)
    nextMonth.setMonth(now.getMonth() + 1)

    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: yesterday.toISOString(),
        timeMax: nextMonth.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
    })

    return res.data.items || []
}

export async function getPeople(accessToken: string, refreshToken: string | undefined | null) {
    const oauth2Client = getOAuthClient()
    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken || undefined
    })

    const people = google.people({ version: 'v1', auth: oauth2Client })

    const res = await people.people.connections.list({
        resourceName: 'people/me',
        personFields: 'names,emailAddresses,phoneNumbers',
        pageSize: 100 // Limit for V1
    })

    return res.data.connections || []
}

export async function createEvent(
    accessToken: string,
    refreshToken: string | undefined | null,
    event: {
        summary: string,
        description?: string,
        start: Date,
        end: Date
    }
) {
    const oauth2Client = getOAuthClient()
    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken || undefined
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    try {
        await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
                summary: event.summary,
                description: event.description,
                start: { dateTime: event.start.toISOString() },
                end: { dateTime: event.end.toISOString() },
            }
        })
    } catch (error) {
        console.error("Error creating Google Calendar event:", error)
        throw error
    }
}
