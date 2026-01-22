
const Parser = require('rss-parser');

async function test(url: string) {
    console.log(`Testing: ${url}`);
    const parser = new Parser({
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml; q=0.1',
        }
    });

    try {
        const feed = await parser.parseURL(url);
        console.log(`Success! Title: ${feed.title}`);
        console.log(`Items: ${feed.items.length}`);
        if (feed.items.length > 0) {
            console.log("First Item:", feed.items[0].title);
        }
    } catch (e: any) {
        console.error("Failed:", e.message);
    }
}

async function main() {
    await test('http://feeds.bbci.co.uk/news/rss.xml'); // Control
    await test('https://uk.indeed.com/rss?q=barber&l=United+Kingdom'); // Target
}

main();
export { }
