import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { env } from '@/env';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = env.NEXT_PUBLIC_APP_URL;

    // Get all published jobs (Fail gracefully if DB not connected during build)
    let jobs: { slug: string; updatedAt: Date }[] = [];

    try {
        jobs = await prisma.job.findMany({
            where: {
                isPublished: true,
                expiryDate: { gt: new Date() },
            },
            select: {
                slug: true,
                updatedAt: true,
            },
            take: 50000,
        });
    } catch (e) {
        console.warn("⚠️ Failed to generate dynamic sitemap (Database likely unreachable during build):", e);
        // Continue with static pages only
    }

    const jobEntries: MetadataRoute.Sitemap = jobs.map((job) => ({
        url: `${baseUrl}/jobs/${job.slug}`,
        lastModified: job.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    return [
        {
            url: `${baseUrl}/jobs`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        ...jobEntries,
    ];
}
