'use server'

import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripe, formatAmount, PLANS } from "@/lib/stripe";
import { env } from "@/env";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function getBillingData() {
    const user = await getCurrentUser()
    if (!user) return null

    const tenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId },
        include: {
            transactions: { orderBy: { createdAt: 'desc' }, take: 10 }
        }
    })

    return tenant
}

export async function createTopUpCheckout(amount: number) {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    // Amount in pence (e.g. 1000 = £10.00)
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: 'Wallet Top Up',
                        description: 'Prepaid credits for SMS & Phone rentals',
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
        cancel_url: `${env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
        metadata: {
            tenantId: user.tenantId,
            type: 'TOP_UP'
        }
    })

    if (session.url) {
        redirect(session.url)
    }
}

export async function createSubscriptionCheckout() {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price: PLANS.PRO_MONTHLY.id,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: `${env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
        cancel_url: `${env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
        metadata: {
            tenantId: user.tenantId,
            type: 'SUBSCRIPTION'
        }
    })

    if (session.url) {
        redirect(session.url)
    }
}
