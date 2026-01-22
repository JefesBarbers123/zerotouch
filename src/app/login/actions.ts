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

export async function loginByEmail(email: string, password?: string) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        redirect('/login?error=Invalid+credentials')
    }

    // If user has a password set, verify it
    if (user.passwordHash && password) {
        const { compare } = await import('bcryptjs')
        const isValid = await compare(password, user.passwordHash)
        if (!isValid) {
            redirect('/login?error=Invalid+credentials')
        }
    } else if (user.passwordHash && !password) {
        // Password required but not provided
        redirect('/login?error=Password+required')
    } else if (!user.passwordHash) {
        // Legacy user (no password) -> ALLOW for now, but ideally force reset
        // Or we can block and say "Please reset password"
        // Let's block and guide to reset
        redirect('/forgot-password?email=' + encodeURIComponent(email))
    }

    await login(user.id)
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
