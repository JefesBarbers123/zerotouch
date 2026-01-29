import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    const body = await req.text()
    const signature = headers().get('Stripe-Signature') as string

    // getStripe will throw if secret is missing, which is good.
    // Ideally we check env.STRIPE_WEBHOOK_SECRET too.
    const stripe = getStripe()

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error("Missing STRIPE_WEBHOOK_SECRET")
        return new Response('Webhook Secret Missing', { status: 500 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error: any) {
        return new Response(`Webhook Error: ${error.message}`, { status: 400 })
    }

    const session = event.data.object as Stripe.Checkout.Session

    if (event.type === 'checkout.session.completed') {
        const tenantId = session.metadata?.tenantId
        const type = session.metadata?.type // 'SUBSCRIPTION' or 'TOP_UP'

        if (!tenantId) {
            return new Response('Missing Tenant ID', { status: 400 })
        }

        if (type === 'SUBSCRIPTION') {
            // Fetch subscription to get status (active vs trialing)
            const subscriptionId = session.subscription as string;
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);

            const status = subscription.status === 'trialing' ? 'TRIAL' : 'ACTIVE';

            // Activate Subscription
            await prisma.tenant.update({
                where: { id: tenantId },
                data: {
                    subscriptionStatus: status,
                    stripeCustomerId: session.customer as string
                }
            })

            // Log Transaction
            await prisma.walletTransaction.create({
                data: {
                    tenantId,
                    amount: Number(session.amount_total) / 100,
                    type: 'SUBSCRIPTION_PAYMENT',
                    description: `Subscription Payment (${status})`
                }
            })

        } else if (type === 'TOP_UP') {
            // Add to Wallet
            const amountAdded = Number(session.amount_total) / 100

            await prisma.tenant.update({
                where: { id: tenantId },
                data: {
                    walletBalance: { increment: amountAdded }
                }
            })

            // Log Transaction
            await prisma.walletTransaction.create({
                data: {
                    tenantId,
                    amount: amountAdded,
                    type: 'WALLET_TOP_UP',
                    description: 'Prepaid Credit Top-up'
                }
            })
        }
    }

    return new Response(null, { status: 200 })
}
