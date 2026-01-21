
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
        // Basic normalization
        return {
            title: rawJob.title.trim(),
            company: rawJob.company.trim(),
            description: rawJob.description, // Might need HTML cleaning later
            location: rawJob.location,
            sourceUrl: rawJob.url,
            postedDate: new Date(rawJob.postedDate),
            remote: rawJob.title.toLowerCase().includes('remote') || rawJob.location.toLowerCase().includes('remote'),
        };
    }
}
