'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function registerShop(formData: FormData) {
    const shopName = formData.get('shopName') as string
    const ownerName = formData.get('ownerName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string

    if (!shopName || !ownerName || !email) {
        throw new Error("Missing required fields")
    }

    // 1. Check if email exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    })

    if (existingUser) {
        // ideally return error to UI, but for V1 simple throw/redirect
        throw new Error("Email already registered")
    }

    // 2. Create Tenant & Owner
    // We use a transaction to ensure both are created or neither
    await prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
            data: {
                name: shopName,
                phone: phone,
                // Defaults: subscription=FREE, wallet=0
            }
        })

        await tx.user.create({
            data: {
                name: ownerName,
                email: email,
                role: email === 'askthejefe@gmail.com' ? 'SUPER_ADMIN' : 'OWNER',
                tenantId: tenant.id
            }
        })
    })

    // 3. Send Welcome Email
    await import('@/lib/email').then(({ sendEmail }) =>
        sendEmail({
            to: email,
            subject: 'Welcome to Zerotouches',
            html: `<p>Hi ${ownerName},</p><p>Welcome to Zerotouches. Your shop <strong>${shopName}</strong> is ready.</p><p>You have full access to the Operating System.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/login">Login Here</a></p>`
        })
    )

    // 3. Redirect to login
    redirect('/login?registered=true')
}
