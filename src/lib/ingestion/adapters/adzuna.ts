
import { Job, RawJob, SourceAdapter } from '../types';

export class AdzunaAdapter implements SourceAdapter {
    async fetchJobs(sourceUrl: string): Promise<RawJob[]> {
        const appId = process.env.ADZUNA_APP_ID;
        const appKey = process.env.ADZUNA_APP_KEY;

        if (!appId || !appKey) {
            console.error('Adzuna credentials missing (ADZUNA_APP_ID, ADZUNA_APP_KEY)');
            return [];
        }

        try {
            // sourceUrl might be "http://api.adzuna.com/v1/api/jobs/gb/search/1?what=barber"
            // We need to append credentials if they aren't there, or just build the URL.
            // Easiest is to assume sourceUrl is the base without creds, or user puts full URL.
            // Let's assume the user puts the base query URL (e.g. search/1?what=barber) and we append creds.

            const urlObj = new URL(sourceUrl);
            urlObj.searchParams.set('app_id', appId);
            urlObj.searchParams.set('app_key', appKey);
            urlObj.searchParams.set('results_per_page', '50');
            urlObj.searchParams.set('content-type', 'application/json');

            const response = await fetch(urlObj.toString());
            if (!response.ok) {
                throw new Error(`Adzuna API Failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return (data.results || []).map((item: any) => ({
                title: item.title,
                company: item.company?.display_name || 'Unknown',
                description: item.description,
                location: item.location?.display_name || 'United Kingdom',
                url: item.redirect_url,
                postedDate: item.created,
                salary: {
                    min: item.salary_min,
                    max: item.salary_max,
                    currency: 'GBP' // Adzuna GB endpoint implies GBP
                },
                jobType: item.contract_type || item.contract_time, // "permanent", "full_time"
                _raw: item,
            }));

        } catch (error) {
            console.error(`Adzuna Fetch Error:`, error);
            return [];
        }
    }

    validate(rawJob: RawJob): boolean {
        if (!rawJob.title || !rawJob.url) return false;

        // Strict filtering: Title must contain barber-related terms
        const title = rawJob.title.toLowerCase();
        const keywords = ['barber', 'hair', 'stylist', 'mens', 'grooming', 'salon', 'fade', 'shave'];
        const isRelevant = keywords.some(k => title.includes(k));

        if (!isRelevant) {
            // console.log(`Skipping irrelevant job: ${rawJob.title}`);
            return false;
        }

        return true;
    }

    normalize(rawJob: RawJob): Partial<Job> {
        const description = rawJob.description
            .replace(/<strong>/g, '') // Basic cleanup if needed, Adzuna sends clean snippets usually
            .replace(/<\/strong>/g, '');

        // Type guard for salary
        let salaryMin: number | undefined;
        let salaryMax: number | undefined;
        let currency: string | undefined;

        if (rawJob.salary && typeof rawJob.salary === 'object') {
            salaryMin = rawJob.salary.min;
            salaryMax = rawJob.salary.max;
            currency = rawJob.salary.currency;
        }

        return {
            title: rawJob.title.replace(/<\/?[^>]+(>|$)/g, ""), // Remove any HTML tags from title
            company: rawJob.company,
            description: description,
            location: rawJob.location,
            sourceUrl: rawJob.url,
            postedDate: new Date(rawJob.postedDate),
            salaryMin,
            salaryMax,
            currency,
            jobType: rawJob.jobType ? rawJob.jobType.replace('_', ' ').toUpperCase() : undefined,
        };
    }
}
