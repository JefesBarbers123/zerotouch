# Barber Retention SaaS (Project Anti-Gravity)

A vertical SaaS for barber businesses focused on client retention, rebooking, and LTV.

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   ```bash
   # Create database from schema
   npx prisma db push
   
   # Config is set to use a local file at: ./prisma/dev.db
   ```

3. **Seed Data**
   ```bash
   # Populate with test users (Mario, Luigi) and clients
   node prisma/seed.js
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   # App runs at http://localhost:3000
   ```

## Troubleshooting

### "not a valid Win32 application" / Prisma Client Error
If you see errors loading `query_engine-windows.dll.node`, it means the native addon is corrupted or incompatible.
We have configured `schema.prisma` to use `engineType = "binary"` to fix this.

**Fix:**
1. Stop the server.
2. Run `npx prisma generate` to download the `.exe` engine instead of the `.dll`.
3. Restart server.

### Database not found
Ensure your `.env` file points to the correct location:
`DATABASE_URL="file:./prisma/dev.db"`

## Features
- **Manual Check-In**: `/check-in`
- **Dashboard**: `/dashboard` (View retention metrics)
- **Messages**: `/messages` (Mock SMS)
- **Retention Logic**: `/api/cron/retention` (Trigger logic)
