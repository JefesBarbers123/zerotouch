
const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3003';

async function verifySite() {
    console.log("Starting Full Site Verification...");
    const report = {
        checked: 0,
        broken: [],
        working: []
    };

    // 1. Auth Setup
    const user = await prisma.user.findFirst({ where: { email: 'askthejefe@gmail.com' } });
    if (!user) throw new Error("Super Admin not found");

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // Login Cookie
    await page.setCookie({
        name: 'userId', value: user.id, domain: 'localhost', path: '/', httpOnly: true
    });

    // 2. Define Critical Paths to Check
    const routes = [
        '/dashboard',
        '/clients',
        '/check-in',
        '/settings',
        '/settings/billing',
        '/settings/phone',
        '/barber/profile',
        '/recruitment', // Discovery
        '/jobs',
        '/notifications',
        '/assisted', // AI Console
        '/help',
        '/admin/super',
        '/admin/sources',
        '/admin/jobs',
        '/admin/reports'
    ];

    console.log(`Checking ${routes.length} core routes...`);

    for (const route of routes) {
        const url = `${BASE_URL}${route}`;
        try {
            const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
            const status = response.status();

            if (status >= 400) {
                console.error(`[FAIL] ${route} returned ${status}`);
                report.broken.push({ route, status });
            } else {
                console.log(`[OK] ${route}`);
                report.working.push(route);

                // 3. Deep Scan: Check for Dead Links on this page
                // Only check internal links to avoid external spam
                const links = await page.$$eval('a', anchors => anchors.map(a => a.href));
                for (const link of links) {
                    if (link.includes('localhost') && !link.includes('#')) {
                        // Quick check? Maybe too slow for everything. 
                        // Let's just log if it looks "empty" or "undefined"
                        if (link.endsWith('undefined') || link.endsWith('null')) {
                            report.broken.push({ route: `Link on ${route}`, target: link, status: 'MALFORMED' });
                        }
                    }
                }
            }
        } catch (e) {
            console.error(`[ERROR] ${route}: ${e.message}`);
            report.broken.push({ route, status: 'ERROR', error: e.message });
        }
        report.checked++;
    }

    await browser.close();
    await prisma.$disconnect();

    console.log("\n--- VERIFICATION REPORT ---");
    console.log(`Checked: ${report.checked}`);
    console.log(`Working: ${report.working.length}`);
    console.log(`Broken: ${report.broken.length}`);

    if (report.broken.length > 0) {
        console.table(report.broken);
        process.exit(1);
    } else {
        console.log("All systems nominal.");
    }
}

verifySite().catch(console.error);
