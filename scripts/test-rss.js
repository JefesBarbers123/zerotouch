
const Parser = require('rss-parser');
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml; q=0.1',
    }
});

async function main() {
    const url = 'https://weworkremotely.com/categories/remote-customer-support-jobs.rss';
    console.log(`Testing feed: ${url}`);
    try {
        const feed = await parser.parseURL(url);
        console.log(`Feed Title: ${feed.title}`);
        console.log(`Items found: ${feed.items.length}`);
        if (feed.items.length > 0) {
            console.log('First Item keys:', Object.keys(feed.items[0]));
            console.log('First Item:', JSON.stringify(feed.items[0], null, 2));
        }
    } catch (e) {
        console.error('Error parsing feed:', e);
    }
}

main();
