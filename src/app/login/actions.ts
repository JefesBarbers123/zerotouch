'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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

export async function logout() {
    cookies().delete('userId')
    redirect('/login')
}
