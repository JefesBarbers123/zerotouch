-- AlterTable
ALTER TABLE "BarberProfile" ADD COLUMN "profileImage" TEXT;

-- AlterTable
ALTER TABLE "ShopProfile" ADD COLUMN "logo" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "churnThresholdDays" INTEGER NOT NULL DEFAULT 28,
    "twilioNumber" TEXT,
    "twilioSid" TEXT,
    "stripeCustomerId" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'FREE',
    "walletBalance" DECIMAL NOT NULL DEFAULT 0.00,
    "smsAutoReplyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsAutoReplyMessage" TEXT DEFAULT 'Sorry, I missed your call. Whats up? Ill call you back in a second'
);
INSERT INTO "new_Tenant" ("address", "churnThresholdDays", "createdAt", "id", "name", "phone", "stripeCustomerId", "subscriptionStatus", "twilioNumber", "twilioSid", "updatedAt", "walletBalance") SELECT "address", "churnThresholdDays", "createdAt", "id", "name", "phone", "stripeCustomerId", "subscriptionStatus", "twilioNumber", "twilioSid", "updatedAt", "walletBalance" FROM "Tenant";
DROP TABLE "Tenant";
ALTER TABLE "new_Tenant" RENAME TO "Tenant";
CREATE TABLE "new_Visit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "notes" TEXT,
    "tenantId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "googleEventId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Visit_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Visit_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Visit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Visit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Visit" ("barberId", "clientId", "createdAt", "date", "id", "notes", "serviceId", "status", "tenantId") SELECT "barberId", "clientId", "createdAt", "date", "id", "notes", "serviceId", "status", "tenantId" FROM "Visit";
DROP TABLE "Visit";
ALTER TABLE "new_Visit" RENAME TO "Visit";
CREATE UNIQUE INDEX "Visit_googleEventId_key" ON "Visit"("googleEventId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
