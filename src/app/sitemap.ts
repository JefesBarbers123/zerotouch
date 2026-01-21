
import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://barbersaas.com';

    // Get all published jobs
    const jobs = await prisma.job.findMany({
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
