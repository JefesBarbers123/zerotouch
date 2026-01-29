import fs from 'fs';

async function main() {
    const url = "https://gb.trabajo.org/jobs-barber";
    console.log(`Fetching ${url}...`);
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const html = await res.text();
        fs.writeFileSync('trabajo.html', html);
        console.log(`Saved ${html.length} bytes to trabajo.html`);
    } catch (e) {
        console.error(e);
    }
}

main();
