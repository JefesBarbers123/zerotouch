
// We can't easily run src code with npx ts-node due to aliases and next environment.
// Instead, we will fetch the API route we created.
async function main() {
    console.log('Triggering Retention Job via API...')

    // Assuming dev server is running on 3000. 
    // If not running, this will fail, so we should ensure server triggers or we mock it.
    // For this context, running the logic directly requires setting up the prisma client correctly in a script.

    console.log('Note: Ensure "npm run dev" is running.')
    const res = await fetch('http://localhost:3000/api/cron/retention')
    const json = await res.json()
    console.log('Result:', JSON.stringify(json, null, 2))
}

main()
