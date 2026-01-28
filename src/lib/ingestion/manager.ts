
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { Job, RawJob, SourceAdapter } from './types';
import { RSSAdapter } from './adapters/rss';
import { APIAdapter } from './adapters/api';
import { ScraperAdapter } from './adapters/scraper';
import { AdzunaAdapter } from './adapters/adzuna';
import { SafetyManager } from '../safety';

const prisma = new PrismaClient();

export class IngestionManager {
    private adapters: Map<string, SourceAdapter>;

    constructor() {
        this.adapters = new Map();
        // Initialize standard adapters. 
        // In a real app, we might modify this to instantate based on DB config on the fly.
        this.adapters.set('RSS', new RSSAdapter());
        this.adapters.set('API', new APIAdapter());
        this.adapters.set('ADZUNA', new AdzunaAdapter());
        // Scraper needs specific selector config, so it might need dynamic instantiation per source
    }

    private getAdapter(type: string, config?: any): SourceAdapter {
        if (type === 'MANUAL') {
            // Manual sources are handled via the Admin UI, not ingestion scripts.
            // Return a dummy adapter that returns empty list to prevent errors.
            return {
                fetchJobs: async () => [],
                validate: () => true,
                normalize: (raw) => ({} as any)
            };
        }

        if (type === 'SCRAPER') {
            // Use provided config or fall back to default
            const safeConfig = config || { container: 'body', title: 'h1', company: '.company', location: '.location', description: '.desc' };
            return new ScraperAdapter(safeConfig);
        }
        const adapter = this.adapters.get(type);
        if (!adapter) throw new Error(`Unknown adapter type: ${type}`);
        return adapter;
    }

    private generateFingerprint(job: Partial<Job>): string {
        const data = `${job.title}|${job.company}|${job.location}`.toLowerCase();
        return crypto.createHash('md5').update(data).digest('hex');
    }

    private generateSlug(title: string, company: string): string {
        const base = `${title}-${company}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const random = crypto.randomBytes(3).toString('hex');
        return `${base}-${random}`;
    }

    async processSource(sourceId: string) {
        const source = await prisma.jobSource.findUnique({ where: { id: sourceId } });
        if (!source || !source.isActive) return;

        try {
            // In a real world, 'config' for scraper would be stored in DB.
            // We'll assume a generic scraper config for demonstration or specific logic here.
            const adapter = this.getAdapter(source.type, source.selectors as any);

            // 1. Safety: Check Robots.txt if it's a scraper
            if (source.type === 'SCRAPER') {
                const allowed = await SafetyManager.checkRobotsTxt(source.url);
                if (!allowed) {
                    throw new Error(`ROBOTS_BLOCK: Access denied by robots.txt for ${source.url}`);
                }
            }

            const rawJobs = await adapter.fetchJobs(source.url);
            console.log(`Fetched ${rawJobs.length} jobs from ${source.name}`);

            for (const raw of rawJobs) {
                if (!adapter.validate(raw)) continue;

                const normalized = adapter.normalize(raw);
                const fingerprint = this.generateFingerprint(normalized);

                // Check duplication
                const existing = await prisma.job.findUnique({ where: { fingerprint } });
                if (existing) {
                    continue; // Skip duplicates
                }

                // 2. Safety: Sanitize & Scam Check
                const cleanDescription = SafetyManager.sanitize(normalized.description || '');
                const isPotentialScam = SafetyManager.isScam(normalized.title || '') || SafetyManager.isScam(cleanDescription);

                // Create new job
                await prisma.job.create({
                    data: {
                        title: normalized.title!,
                        company: normalized.company || 'Unknown',
                        description: cleanDescription,
                        location: normalized.location || 'Remote',
                        sourceUrl: normalized.sourceUrl || source.url,
                        postedDate: normalized.postedDate || new Date(),
                        fingerprint,
                        slug: this.generateSlug(normalized.title!, normalized.company || ''),
                        sourceId: source.id,
                        jobType: normalized.jobType,
                        salaryMin: normalized.salaryMin,
                        salaryMax: normalized.salaryMax,
                        currency: normalized.currency,
                        remote: normalized.remote || false,
                        isFlagged: isPotentialScam, // Auto-flag
                        isPublished: !isPotentialScam // Auto-hide if flagged
                    }
                });
            }

            await prisma.jobSource.update({
                where: { id: source.id },
                data: { lastChecked: new Date(), lastStatus: 'SUCCESS', errorMsg: null }
            });

        } catch (error: any) {
            console.error(`Error processing source ${source.name}:`, error);
            await prisma.jobSource.update({
                where: { id: source.id },
                data: { lastChecked: new Date(), lastStatus: 'ERROR', errorMsg: error.message }
            });
        }
    }
}
