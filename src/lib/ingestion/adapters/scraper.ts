
import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';
import { Job, RawJob, SourceAdapter, ScrapeTargetSelector } from '../types';

export class ScraperAdapter implements SourceAdapter {
    private selector: ScrapeTargetSelector;

    constructor(selector: ScrapeTargetSelector) {
        this.selector = selector;
    }

    private cleanText(text: string): string {
        return text.replace(/\s+/g, ' ').trim();
    }

    private parseDate(dateStr: string): Date {
        const now = new Date();
        const clean = dateStr.toLowerCase();

        try {
            if (clean.includes('ago')) {
                const num = parseInt(clean.match(/\d+/)?.[0] || '0');
                if (clean.includes('minute')) return new Date(now.getTime() - num * 60 * 1000);
                if (clean.includes('hour')) return new Date(now.getTime() - num * 60 * 60 * 1000);
                if (clean.includes('day')) return new Date(now.getTime() - num * 24 * 60 * 60 * 1000);
                if (clean.includes('week')) return new Date(now.getTime() - num * 7 * 24 * 60 * 60 * 1000);
                if (clean.includes('month')) return new Date(now.getTime() - num * 30 * 24 * 60 * 60 * 1000);
            }
            const parsed = new Date(dateStr);
            return isNaN(parsed.getTime()) ? now : parsed;
        } catch {
            return now;
        }
    }

    async checkRobotsTxt(baseUrl: string, targetPath: string): Promise<boolean> {
        try {
            const robotsUrl = new URL('/robots.txt', baseUrl).toString();
            const robotsRes = await fetch(robotsUrl);
            if (!robotsRes.ok) return true; // Assume allow if no robots.txt or error (per standard, usually) - or strict mode? Standard says allow.

            const robotsTxt = await robotsRes.text();
            const robots = robotsParser(robotsUrl, robotsTxt);
            return robots.isAllowed(new URL(targetPath, baseUrl).toString(), 'Bot') ?? true; // Use generic Bot or specific User-Agent if we set one
        } catch (e) {
            // If robots.txt fails, default to allow, but log
            console.warn(`Robots.txt check failed for ${baseUrl}, assuming allowed.`);
            return true;
        }
    }

    async fetchJobs(sourceUrl: string): Promise<RawJob[]> {
        const isAllowed = await this.checkRobotsTxt(new URL(sourceUrl).origin, new URL(sourceUrl).pathname);
        if (!isAllowed) {
            console.warn(`Blocked by robots.txt: ${sourceUrl}`);
            return [];
        }

        try {
            const response = await fetch(sourceUrl, {
                headers: {
                    'User-Agent': 'BarberSaasBot/1.0 (+http://your-site.com/bot)'
                }
            });
            if (!response.ok) throw new Error(`Scraper failed: ${response.status}`);

            const html = await response.text();
            const $ = cheerio.load(html);
            const jobs: RawJob[] = [];

            $(this.selector.container).each((_, el) => {
                const title = this.cleanText($(el).find(this.selector.title).text());
                const company = this.cleanText($(el).find(this.selector.company).text());
                const location = this.cleanText($(el).find(this.selector.location).text());
                const link = $(el).find('a').attr('href'); // Naive link finding, might need selector

                // New fields
                let postedDate: Date = new Date();
                let description = '';
                let salary = '';
                let jobType = '';

                if (this.selector.date) {
                    const dateStr = this.cleanText($(el).find(this.selector.date).text());
                    if (dateStr) postedDate = this.parseDate(dateStr);
                }

                if (this.selector.description) {
                    description = this.cleanText($(el).find(this.selector.description).text());
                }

                if (this.selector.salary) {
                    salary = this.cleanText($(el).find(this.selector.salary).text());
                }

                if (this.selector.jobType) {
                    jobType = this.cleanText($(el).find(this.selector.jobType).text());
                }

                if (title && link) {
                    jobs.push({
                        title,
                        company,
                        location,
                        url: new URL(link, sourceUrl).toString(),
                        description,
                        postedDate,
                        salary,
                        jobType,
                        _raw: {},
                    });
                }
            });

            return jobs;
        } catch (error) {
            console.error(`Scrape Error for ${sourceUrl}:`, error);
            return [];
        }
    }

    validate(rawJob: RawJob): boolean {
        return !!(rawJob.title && rawJob.url);
    }

    normalize(rawJob: RawJob): Partial<Job> {
        return {
            title: rawJob.title,
            company: rawJob.company,
            location: rawJob.location,
            sourceUrl: rawJob.url,
            postedDate: new Date(rawJob.postedDate),
        };
    }
}
