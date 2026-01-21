
import { Job, RawJob, SourceAdapter } from '../types';

export class APIAdapter implements SourceAdapter {
    async fetchJobs(sourceUrl: string): Promise<RawJob[]> {
        try {
            const response = await fetch(sourceUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch API: ${response.statusText}`);
            }
            const data = await response.json();

            // Default assumption: API returns an array of objects or an object with a 'jobs' array
            // This might need source-specific mapping logic injected in the constructor in a real scenario
            const jobsArray = Array.isArray(data) ? data : data.jobs || data.data || [];

            return jobsArray.map((item: any) => ({
                title: item.title || item.role || '',
                company: item.company_name || item.company || 'Unknown',
                description: item.description || item.body || '',
                location: item.location || item.city || 'Remote/Unknown',
                url: item.url || item.link || '',
                postedDate: item.created_at || item.date_posted || new Date(),
                salary: item.salary || { min: item.salary_min, max: item.salary_max, currency: item.currency },
                jobType: item.job_type,
                _raw: item,
            }));
        } catch (error) {
            console.error(`API Fetch Error for ${sourceUrl}:`, error);
            return [];
        }
    }

    validate(rawJob: RawJob): boolean {
        return !!(rawJob.title && rawJob.url);
    }

    normalize(rawJob: RawJob): Partial<Job> {
        return {
            title: rawJob.title.trim(),
            company: rawJob.company.trim(),
            description: rawJob.description,
            location: rawJob.location,
            sourceUrl: rawJob.url,
            postedDate: new Date(rawJob.postedDate),
            remote: rawJob.title.toLowerCase().includes('remote') || (typeof rawJob.location === 'string' && rawJob.location.toLowerCase().includes('remote')),
            // Simple mapped fields
            jobType: rawJob.jobType,
        };
    }
}
