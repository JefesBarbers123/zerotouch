
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(process.cwd(), '.env');
console.log('Checking .env at:', envPath);

if (fs.existsSync(envPath)) {
    console.log('.env file FOUND.');
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    // Also load into process.env to simulate runtime
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} else {
    console.log('.env file NOT FOUND.');
}

console.log('--- Environment Variables ---');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'LOADED (' + process.env.GOOGLE_CLIENT_ID.substring(0, 10) + '...)' : 'UNDEFINED');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'LOADED (***HIDDEN***)' : 'UNDEFINED');
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI ? process.env.GOOGLE_REDIRECT_URI : 'UNDEFINED');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
