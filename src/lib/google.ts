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
