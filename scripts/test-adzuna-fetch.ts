
import { AdzunaAdapter } from '../src/lib/ingestion/adapters/adzuna'
import { config } from 'dotenv'
import fs from 'fs'

// Load env vars from .env
config()

async function main() {
    let output = "";
    const log = (msg: string) => { output += msg + "\n"; console.log(msg); };

    log("--- Testing Adzuna API Fetch ---")

    if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
        console.error("❌ Credentials missing in process.env")
        process.exit(1)
    }

    const adapter = new AdzunaAdapter()
    const sourceUrl = "https://api.adzuna.com/v1/api/jobs/gb/search/1?what=hairdresser&results_per_page=50&content-type=application/json"

    log(`Fetching from: ${sourceUrl}`)
    log(`App ID: ${process.env.ADZUNA_APP_ID.substring(0, 4)}...`)

    try {
        const rawJobs = await adapter.fetchJobs(sourceUrl)
        log(`\nRequested URL: ${sourceUrl}`)
        log(`Raw Results Count: ${rawJobs.length}`)

        // Check how many pass validation
        const validJobs = rawJobs.filter(j => adapter.validate(j));
        log(`Valid Jobs Count: ${validJobs.length}`)

        if (rawJobs.length > 0 && validJobs.length < rawJobs.length) {
            log("\n--- Discarded Jobs (Sample) ---")
            const discarded = rawJobs.filter(j => !adapter.validate(j));
            discarded.slice(0, 10).forEach(d => {
                log(`[REJECTED] ${d.title} @ ${d.company}`)
            });
        }

        if (validJobs.length > 0) {
            log("\n--- Accepted Jobs (Sample) ---")
            const accepted = validJobs.slice(0, 10);
            accepted.forEach(a => {
                log(`[ACCEPTED] ${a.title} @ ${a.company}`)
            });
        }

        fs.writeFileSync('adzuna_debug_log.txt', output);
        console.log("Log saved to adzuna_debug_log.txt");

    } catch (e) {
        console.error("❌ Fetch Failed:")
        console.error(e)
    }
}

main()
