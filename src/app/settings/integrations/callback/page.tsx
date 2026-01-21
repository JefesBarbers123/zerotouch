
import { handleGoogleCallback } from '../actions'
import { redirect } from 'next/navigation'

export default async function GoogleCallbackPage({ searchParams }: { searchParams: { code?: string } }) {
    const code = searchParams.code

    if (!code) {
        return (
            <div className="p-8 text-red-600">
                <h1>Error</h1>
                <p>No authorization code returned from Google.</p>
            </div>
        )
    }

    try {
        await handleGoogleCallback(code)
        // Redirection happens in the action
    } catch (e) {
        return (
            <div className="p-8 text-red-600">
                <h1>Integration Failed</h1>
                <p>{(e as Error).message}</p>
            </div>
        )
    }

    return (
        <div className="p-8">
            <h1>Connecting...</h1>
            <p>Please wait while we secure your connection.</p>
        </div>
    )
}
