
import Parser from 'rss-parser';
import { Job, RawJob, SourceAdapter } from '../types';

export class RSSAdapter implements SourceAdapter {
    private parser: Parser;

    constructor() {
        this.parser = new Parser({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml; q=0.1',
            }
        });
    }

    async fetchJobs(sourceUrl: string): Promise<RawJob[]> {
        try {
            const feed = await this.parser.parseURL(sourceUrl);
            return feed.items.map((item) => ({
                title: item.title || '',
                company: item['dc:creator'] || item.creator || 'Unknown', // Common RSS fields, might differ
                description: item.content || item.contentSnippet || '',
                location: item.categories?.join(', ') || 'Remote/Unknown', // RSS often lacks location, might need heuristics
                url: item.link || '',
                postedDate: item.pubDate || new Date(),
                // Store raw item for further custom extraction if needed
                _raw: item,
            }));
        } catch (error) {
            console.error(`RSS Fetch Error for ${sourceUrl}:`, error);
            return [];
        }
    }

    validate(rawJob: RawJob): boolean {
        return !!(rawJob.title && rawJob.url && rawJob.description);
    }

    normalize(rawJob: RawJob): Partial<Job> {
        // Google Alerts specific cleaning
        let url = rawJob.url;

        // Loop to handle nested redirects if necessary, but usually one pass is enough for Google Alerts
        if (url && url.includes('google.com/url')) {
            const match = url.match(/[?&]url=([^&]+)/);
            if (match) {
                try {
                    url = decodeURIComponent(match[1]);
                } catch (e) {
                    // Start URL as is failure
                }
            }
        }

        // Aggressive Title Cleaning: Remove HTML, Google Alerts prefixes, and extra whitespace
        let cleanTitle = rawJob.title
            .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
            .replace(/^Google Alert - /i, "") // Remove "Google Alert -" prefix if present
            .replace(/\s+/g, " ") // Collapse whitespace
            .trim();

        // Heuristic: If description is truncated HTML, try to clean it too
        const cleanDescription = rawJob.description
            .replace(/<br\s*\/?>/gi, "\n") // Convert breaks to newlines
            .replace(/<\/?[^>]+(>|$)/g, "") // Remove other tags
            .trim();

        return {
            title: cleanTitle,
            company: rawJob.company.trim(),
            description: cleanDescription, // Use cleaner description
            location: rawJob.location,
            sourceUrl: url,
            postedDate: new Date(rawJob.postedDate),
            remote: cleanTitle.toLowerCase().includes('remote') || (rawJob.location || '').toLowerCase().includes('remote'),
        };
    }
}
