
const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function capture() {
    console.log("Starting Screenshot Capture...");

    // 1. Get User for Auth
    const user = await prisma.user.findFirst({
        where: { email: 'askthejefe@gmail.com' }
    });

    if (!user) {
        throw new Error("User askthejefe@gmail.com not found!");
    }
    console.log(`Authenticated as: ${user.name} (${user.id})`);

    // 2. Launch Browser
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: "new"
    });
    const page = await browser.newPage();

    // 3. Set Auth Cookie
    await page.setCookie({
        name: 'userId',
        value: user.id,
        domain: 'localhost',
        path: '/',
        httpOnly: true, // mimicing server cookie
    });

    // 4. Set Viewport
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

    const screenshots = [
        { url: 'http://localhost:3003/dashboard', path: 'public/help/dashboard.png' },
        { url: 'http://localhost:3003/settings/phone', path: 'public/help/concierge.png' },
        { url: 'http://localhost:3003/settings/integrations', path: 'public/help/crm.png' },
        { url: 'http://localhost:3003/admin/reports', path: 'public/help/admin.png' } // Bonus
    ];

    for (const item of screenshots) {
        console.log(`Capturing ${item.url}...`);
        try {
            await page.goto(item.url, { waitUntil: 'networkidle0' });

            // Optional: inject some CSS to ensure it looks perfect? 
            // Or wait for specific unique elements

            await page.screenshot({ path: item.path });
            console.log(`Saved to ${item.path}`);
        } catch (e) {
            console.error(`Failed to capture ${item.url}:`, e);
        }
    }

    await browser.close();
    await prisma.$disconnect();
    console.log("Capture Complete.");
}

capture().catch(e => {
    console.error(e);
    process.exit(1);
});
