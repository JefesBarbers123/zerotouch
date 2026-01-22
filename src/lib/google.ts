import { google } from 'googleapis';
import { env } from '@/env';

// Initialize the OAuth2 Client
export const getGoogleOAuthClient = () => {
    // These should be set in .env
    const clientId = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;

    // The callback URL must match exactly what is configured in Google Cloud Console
    // We construct it dynamically based on the APP_URL
    const redirectUri = env.GOOGLE_REDIRECT_URI || `${env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
        console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
        // We return the client anyway, but calls will fail if keys are missing.
        // It's better to log error here.
    }

    return new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
    );
};

export const getGoogleAuthUrl = () => {
    const oauth2Client = getGoogleOAuthClient();

    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes,
    });
};

export const verifyGoogleToken = async (idToken: string) => {
    const client = getGoogleOAuthClient();
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
};

export const getTokens = async (code: string) => {
    const client = getGoogleOAuthClient()
    const { tokens } = await client.getToken(code)
    return tokens
}

export const listEvents = async (accessToken: string, refreshToken: string | null | undefined) => {
    const client = getGoogleOAuthClient()
    client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken || undefined
    })

    const calendar = google.calendar({ version: 'v3', auth: client })
    const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
    })

    return response.data.items || []
}

export const getPeople = async (accessToken: string, refreshToken: string | null | undefined) => {
    const client = getGoogleOAuthClient()
    client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken || undefined
    })

    const people = google.people({ version: 'v1', auth: client })
    const response = await people.people.connections.list({
        resourceName: 'people/me',
        personFields: 'names,emailAddresses,phoneNumbers',
        pageSize: 100
    })

    return response.data.connections || []
}

export const getUserInfo = async (accessToken: string) => {
    const client = getGoogleOAuthClient()
    client.setCredentials({ access_token: accessToken })

    const oauth2 = google.oauth2({ version: 'v2', auth: client })
    const { data } = await oauth2.userinfo.get()

    return data
}
