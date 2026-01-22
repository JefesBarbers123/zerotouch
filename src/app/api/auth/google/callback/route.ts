import { getGoogleOAuthClient } from '@/lib/google'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
        return redirect('/login?error=Google+Auth+Failed')
    }

    if (!code) {
        return redirect('/login?error=No+Code+Provided')
    }

    try {
        const client = getGoogleOAuthClient()
        const { tokens } = await client.getToken(code)

        // client.setCredentials(tokens); // Not strictly needed unless making API calls

        const idToken = tokens.id_token
        if (!idToken) {
            throw new Error("No ID Token found")
        }

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        })

        const payload = ticket.getPayload()
        if (!payload || !payload.email) {
            throw new Error("No Email in Google Token")
        }

        const email = payload.email
        const name = payload.name || email.split('@')[0]
        const picture = payload.picture

        // Find or Create User
        let user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            // OPTION 1: Auto-SignUp (For now, let's allow it for seamless testing, or link to invite)
            // If strict invite only: 
            // return redirect('/login?error=Account+not+found.+Please+ask+for+an+invite.')

            // For now, let's fail if no user, as user asked for "login", not "signup" explicitly? 
            // Actually usually "login with google" implies signup.
            // But this app has tenant model. Creating a user without a tenant is invalid if schema requires it.
            // Let's check schema. User usually belongs to Tenant.
            // If new user, we don't know which tenant.
            // So we can only log in EXISTING users.

            return redirect(`/login?error=No+account+found+for+${email}.+Please+ask+admin+for+invite.`)
        } else {
            // Update avatar if missing? 
            // await prisma.user.update(...) 
        }

        // Set Session Cookie (Simulating the 'login' action)
        cookies().set('userId', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/'
        })

        return redirect('/dashboard')

    } catch (error) {
        console.error("Google Callback Error:", error)
        return redirect('/login?error=Authentication+Failed')
    }
}
