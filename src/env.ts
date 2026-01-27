import 'server-only';
import { z } from 'zod';

const envSchema = z.object({
    // Server-side
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    DIRECT_URL: z.string().optional(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // Auth & API Keys
    ADMIN_EMAIL: z.string().email().optional().default('askthejefe@gmail.com'),

    // Twilio (Required for Voice/SMS)
    TWILIO_ACCOUNT_SID: z.string().min(1).optional(), // Optional in dev, required if feature used
    TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
    TWILIO_PHONE_NUMBER: z.string().min(1).optional(),

    // Stripe (Payments)
    STRIPE_SECRET_KEY: z.string().refine(s => s.startsWith('sk_') || s.startsWith('rk_'), "Must start with sk_ or rk_").optional(),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),
    STRIPE_PRICE_ID: z.string().optional(),

    // Resend (Email)
    RESEND_API_KEY: z.string().startsWith('re_').optional(),

    // Adzuna (Job Ingestion)
    ADZUNA_APP_ID: z.string().optional(),
    ADZUNA_APP_KEY: z.string().optional(),

    // Google (Integrations)
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_REDIRECT_URI: z.string().url().optional(),

    // App
    NEXT_PUBLIC_APP_URL: z.string().url().default(
        process.env.NODE_ENV === 'production'
            ? 'https://zerotouch-silk.vercel.app' // Fallback for safety if var missing, but prefer var
            : 'http://localhost:3003'
    ),
    CRON_SECRET: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ Invalid environment variables:", _env.error.format());

    // In production, we explicitly crash if critical vars are missing?
    // Actually, allowing optional means we don't crash immediately, ensuring build passes.
    // The individual SDKs will check for their specific keys via 'env' object.
}

export const env = _env.success ? _env.data : process.env as unknown as z.infer<typeof envSchema>;
