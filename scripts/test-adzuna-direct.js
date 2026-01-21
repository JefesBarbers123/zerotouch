
// Standalone Adzuna test 
// Since we are in JS land for scripts, and the adapter is TS, it's annoying to import directly without compilation.
// Instead, let's just replicate the fetch logic in a simple JS script to verify keys.

require('dotenv').config();

async function main() {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    console.log('--- Adzuna Config ---');
    console.log(`App ID present: ${!!appId} (${appId ? appId.substring(0, 2) + '...' : 'missing'})`);
    console.log(`App Key present: ${!!appKey} (${appKey ? 'Yes' : 'No'})`);

    if (!appId || !appKey) {
        console.error('Missing credentials in .env');
        return;
    }

    const url = `http://api.adzuna.com/v1/api/jobs/gb/search/1?what=barber&app_id=${appId}&app_key=${appKey}&content-type=application/json`;
    console.log(`\nFetching: ${url.replace(appKey, '***')}`);

    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status} ${res.statusText}`);

        if (!res.ok) {
            console.error('Body:', await res.text());
        } else {
            const data = await res.json();
            console.log(`Results found: ${data.results ? data.results.length : 0}`);
            if (data.results && data.results.length > 0) {
                console.log('First result:', data.results[0].title, 'at', data.results[0].company.display_name);
            }
        }
    } catch (e) {
        console.error('Fetch failed:', e);
    }
}

main();
