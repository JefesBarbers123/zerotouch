
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16', // Use latest stable
    typescript: true,
} as any);

export const PLANS = {
    PRO_MONTHLY: {
        id: process.env.STRIPE_PRICE_ID!,
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
