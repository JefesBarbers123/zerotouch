
async function main() {
    const url = 'https://uk.indeed.com/jobs?q=barber&l=London';
    console.log(`Fetching ${url}...`);

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://uk.indeed.com/',
                'Cache-Control': 'max-age=0',
                'Upgrade-Insecure-Requests': '1'
            }
        });

        console.log(`Status: ${response.status}`);
        const html = await response.text();

        if (html.includes('job_seen_beacon') || html.includes('jobTitle')) {
            console.log('SUCCESS: Found job markers in HTML.');
        } else if (html.includes('Cloudflare') || html.includes('challenge')) {
            console.log('BLOCKED: Cloudflare challenge detected.');
        } else {
            console.log('UNKNOWN: No jobs or typical blocks found.');
            console.log('Snippet:', html.substring(0, 500));
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

main();
