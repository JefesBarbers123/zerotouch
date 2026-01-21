
const puppeteer = require('puppeteer');

async function main() {
    console.log('Launching browser...');
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    } catch (e) {
        console.error('Failed to launch browser. Ensure you are running on a supported OS with headers.', e);
        return;
    }

    const page = await browser.newPage();

    // Set a real user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const url = 'https://uk.indeed.com/jobs?q=barber&l=London';
    console.log(`Navigating to ${url}...`);

    try {
        await page.goto(url, { waitUntil: 'networkidle2' });

        const title = await page.title();
        console.log(`Page Title: ${title}`);

        // Check if we got jobs
        const jobCount = await page.$$eval('.job_seen_beacon', (els) => els.length);
        console.log(`Jobs found on page: ${jobCount}`);

        if (jobCount > 0) {
            // Extract first job as proof
            const firstJob = await page.$eval('.job_seen_beacon', (el) => {
                return {
                    title: el.querySelector('h2')?.innerText,
                    company: el.querySelector('[data-testid="company-name"]')?.innerText
                }
            });
            console.log('Sample Job:', firstJob);
        } else {
            console.log('No jobs found. Possible Cloudflare/Captcha block.');
            // Take screenshot/dump html if needed, but for now just log text
            const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 200));
            console.log('Body start:', bodyText);
        }

    } catch (error) {
        console.error('Navigation error:', error);
    } finally {
        await browser.close();
    }
}

main();
