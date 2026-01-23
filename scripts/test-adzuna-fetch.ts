
import { AdzunaAdapter } from '../src/lib/ingestion/adapters/adzuna'
import { config } from 'dotenv'

// Load env vars from .env
config()

async function main() {
    console.log("--- Testing Adzuna API Fetch ---")

    if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
        console.error("❌ Credentials missing in process.env")
        process.exit(1)
    }

    const adapter = new AdzunaAdapter()
    const sourceUrl = "https://api.adzuna.com/v1/api/jobs/gb/search/1?what=barber&results_per_page=5&content-type=application/json"

    console.log(`Fetching from: ${sourceUrl}`)
    console.log(`App ID: ${process.env.ADZUNA_APP_ID.substring(0, 4)}...`)

    try {
        const jobs = await adapter.fetchJobs(sourceUrl)
        console.log(`\n✅ Fetch Success! Found ${jobs.length} jobs.`)

        if (jobs.length > 0) {
            console.log("\nSample Job:")
            console.log("Title:", jobs[0].title)
            console.log("Company:", jobs[0].company)
            console.log("Location:", jobs[0].location)
            console.log("URL:", jobs[0].url)

            const normalized = adapter.normalize(jobs[0])
            console.log("\nNormalized Data:")
            console.log(normalized)
        }
    } catch (e) {
        console.error("❌ Fetch Failed:")
        console.error(e)
    }
}

main()
