'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { randomBytes } from 'crypto'

export async function requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
        // Generate token
        const token = randomBytes(32).toString('hex')
        const expiry = new Date(Date.now() + 3600000 * 24) // 24 hours

        // Log link to console for debugging/admin access
        console.log(`[PASSWORD RESET] Link for ${email}: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`)

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: token,
                resetTokenExpiry: expiry
            }
        })

        // Send Email
        const link = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

        await import('@/lib/email').then(({ sendEmail }) =>
            sendEmail({
                to: email,
                subject: 'Reset your Zerotouches password',
                html: `<p>Click here to reset your password: <a href="${link}">${link}</a></p><p>Valid for 1 hour.</p>`
            })
        )

        // Log it for dev purposes since user doesn't have real email
        console.log(`[DEV] Password Reset Link for ${email}: ${link}`)
    }

    // Always redirect to 'sent' page to prevent email enumeration
    redirect('/forgot-password?sent=true')
}

export async function resetPassword(token: string, password: string) {
    const user = await prisma.user.findUnique({
        where: { resetToken: token }
    })

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        throw new Error("Invalid token")
    }

    const { hash } = await import('bcryptjs')
    const passwordHash = await hash(password, 10)

    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordHash,
            resetToken: null,
            resetTokenExpiry: null
        }
    })

    redirect('/login?reset=true')
}
