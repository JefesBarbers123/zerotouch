
export interface Job {
    title: string;
    company: string;
    description: string; // HTML allowed
    location: string;
    city?: string;
    country?: string;
    remote: boolean;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    jobType?: string; // "FULL_TIME", "PART_TIME", "CONTRACT", "APPRENTICESHIP"
    postedDate: Date;
    expiryDate?: Date;
    sourceUrl: string;
    sourceId: string;
    fingerprint: string;
}

export interface RawJob {
    title: string;
    company: string;
    description: string;
    location: string;
    url: string;
    postedDate: string | Date;
    salary?: string | { min?: number; max?: number; currency?: string };
    jobType?: string;
    [key: string]: any;
}

export interface SourceAdapter {
    fetchJobs(sourceUrl: string): Promise<RawJob[]>;
    validate(rawJob: RawJob): boolean;
    normalize(rawJob: RawJob): Partial<Job>;
}

export type ScrapeTargetSelector = {
    container: string;
    title: string;
    company: string;
    description: string; // The URL to the description page, or the selector if on same page
    location: string;
    date?: string;
    salary?: string;
    jobType?: string;
}
