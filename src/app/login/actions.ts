'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { prisma } from '@/lib/prisma'

export async function login(userId: string) {
    // Set cookie
    cookies().set('userId', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
    })

    redirect('/dashboard')
}

export async function loginByEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
        await login(user.id)
    } else {
        // For security, don't reveal if user exists, but here we just redirect back
        // Ideally show error. For now, redirect to register or show error.
        // Since we can't easily pass state back without useFormState (which requires client component),
        // we'll just redirect to login with a query param? or throw.
        // Let's redirect with error param.
        redirect('/login?error=Invalid+credentials')
    }
}

export async function logout() {
    cookies().delete('userId')
    redirect('/login')
}

export async function loginWithGoogle() {
    const { getGoogleAuthUrl } = await import('@/lib/google')
    const url = getGoogleAuthUrl()
    redirect(url)
}
