
import sanitizeHtml from 'sanitize-html';
import robotsParser from 'robots-parser';

export const SCAM_KEYWORDS = [
    'western union',
    'check processing',
    'telegram only',
    'whatsapp only',
    'no experience needed',
    'immediate start',
    'work from home', // Context dependent, but often spammy in barber context
    'cash app',
    'crypto',
    'investment'
];

export class SafetyManager {

    /**
     * Sanitizes HTML content to remove scripts, iframes, and other dangerous tags.
     */
    static sanitize(content: string): string {
        return sanitizeHtml(content, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                'img': ['src', 'alt']
            },
            disallowedTagsMode: 'discard'
        });
    }

    /**
     * Checks if a job title or description contains scam keywords.
     * @returns true if flagged
     */
    static isScam(text: string): boolean {
        const lower = text.toLowerCase();
        return SCAM_KEYWORDS.some(keyword => lower.includes(keyword));
    }

    /**
     * Checks if a URL is allowed by robots.txt
     */
    static async checkRobotsTxt(url: string): Promise<boolean> {
        try {
            const u = new URL(url);
            const robotsUrl = `${u.protocol}//${u.host}/robots.txt`;

            const response = await fetch(robotsUrl);
            if (!response.ok) return true; // If no robots.txt, assume allowed (standard)

            const txt = await response.text();
            const robots = robotsParser(robotsUrl, txt);

            // Check for our bot instructions or generic "*"
            const isAllowedBot = robots.isAllowed(url, 'ZerotouchesBot');
            const isAllowedAll = robots.isAllowed(url, '*');

            // Default to true if undefined (no rules)
            return (isAllowedBot ?? true) && (isAllowedAll ?? true);
        } catch (e) {
            console.error(`Failed to check robots.txt for ${url}`, e);
            return true; // Fail open if unsure, or closed based on policy. Standard is open.
        }
    }
}
