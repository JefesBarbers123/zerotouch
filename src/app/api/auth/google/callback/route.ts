import { NextRequest, NextResponse } from 'next/server'
import { getTokens, getUserInfo } from '@/lib/google'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
        return NextResponse.redirect(new URL('/login?error=Google+Sign-In+Failed', request.url))
    }

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=No+Code+Provided', request.url))
    }

    try {
        // Exchange code for tokens
        const tokens = await getTokens(code)

        if (!tokens.access_token) {
            throw new Error("No access token received")
        }

        // Get user info
        const googleUser = await getUserInfo(tokens.access_token)
        const email = googleUser.email

        if (!email) {
            return NextResponse.redirect(new URL('/login?error=No+Email+Provided', request.url))
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            // New User Flow: Redirect to Register with pre-filled details
            const params = new URLSearchParams()
            params.set('email', email)
            if (googleUser.name) params.set('name', googleUser.name)

            return NextResponse.redirect(new URL(`/register?${params.toString()}`, request.url))
        }

        // Login successful - Set cookie
        cookies().set('userId', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/'
        })

        return NextResponse.redirect(new URL('/dashboard', request.url))

    } catch (e: any) {
        console.error("[Google Auth Error]", e)
        return NextResponse.redirect(new URL('/login?error=Authentication+Error', request.url))
    }
}
