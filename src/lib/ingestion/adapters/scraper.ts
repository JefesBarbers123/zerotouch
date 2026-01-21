
import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';
import { Job, RawJob, SourceAdapter, ScrapeTargetSelector } from '../types';

export class ScraperAdapter implements SourceAdapter {
    private selector: ScrapeTargetSelector;

    constructor(selector: ScrapeTargetSelector) {
        this.selector = selector;
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
                const title = $(el).find(this.selector.title).text().trim();
                const company = $(el).find(this.selector.company).text().trim();
                const location = $(el).find(this.selector.location).text().trim();
                const link = $(el).find('a').attr('href'); // Naive link finding, might need selector

                // Description implies often visiting the link. 
                // For the listing page, we might just get a snippet.
                // Deep scraping logic would go here if needed, but keeping it simple for listing scrape.

                if (title && link) {
                    jobs.push({
                        title,
                        company,
                        location,
                        url: new URL(link, sourceUrl).toString(),
                        description: '', // Often empty on listing page
                        postedDate: new Date(),
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
