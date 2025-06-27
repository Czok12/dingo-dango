-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_creditors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ustId" TEXT,
    "iban" TEXT,
    "address" TEXT,
    "city" TEXT,
    "zipCode" TEXT,
    "country" TEXT,
    "defaultAccount" TEXT,
    "creditorAccount" TEXT,
    "paymentTerms" INTEGER,
    "accountCode" TEXT,
    "isFromKontenplan" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "preferredTemplate" TEXT,
    "keywords" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_creditors" ("address", "city", "country", "createdAt", "defaultAccount", "iban", "id", "isActive", "name", "notes", "paymentTerms", "updatedAt", "ustId", "zipCode") SELECT "address", "city", "country", "createdAt", "defaultAccount", "iban", "id", "isActive", "name", "notes", "paymentTerms", "updatedAt", "ustId", "zipCode" FROM "creditors";
DROP TABLE "creditors";
ALTER TABLE "new_creditors" RENAME TO "creditors";
CREATE UNIQUE INDEX "creditors_ustId_key" ON "creditors"("ustId");
CREATE TABLE "new_skr03_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountCode" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "keywords" TEXT,
    "parentCode" TEXT,
    "isCreditor" BOOLEAN NOT NULL DEFAULT false,
    "isDebitor" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_skr03_accounts" ("accountCode", "accountName", "accountType", "category", "createdAt", "id", "isActive", "updatedAt") SELECT "accountCode", "accountName", "accountType", "category", "createdAt", "id", "isActive", "updatedAt" FROM "skr03_accounts";
DROP TABLE "skr03_accounts";
ALTER TABLE "new_skr03_accounts" RENAME TO "skr03_accounts";
CREATE UNIQUE INDEX "skr03_accounts_accountCode_key" ON "skr03_accounts"("accountCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
