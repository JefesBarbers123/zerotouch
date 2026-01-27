
import Stripe from 'stripe';
import { env } from '@/env';

// Lazy initialization prevents build-time crashes if keys are missing
export function getStripe() {
    if (!env.STRIPE_SECRET_KEY) {
        throw new Error("Missing STRIPE_SECRET_KEY env variable");
    }

    return new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16' as any,
        typescript: true,
    });
}

const stripePriceId = env.STRIPE_PRICE_ID;
if (!stripePriceId) {
    // We allow build to pass but runtime will fail if used
    console.warn("WARN: STRIPE_PRICE_ID is missing. Payments will fail.");
}

export const PLANS = {
    PRO_MONTHLY: {
        id: stripePriceId || 'missing_price_id',
        price: 3000,
        name: 'Operation & Systems Plan'
    }
}

export function formatAmount(amount: number) {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
    }).format(amount / 100);
}
