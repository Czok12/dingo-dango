-- CreateTable
CREATE TABLE "creditors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ustId" TEXT,
    "iban" TEXT,
    "address" TEXT,
    "city" TEXT,
    "zipCode" TEXT,
    "country" TEXT,
    "defaultAccount" TEXT,
    "paymentTerms" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "supplierName" TEXT,
    "supplierTaxId" TEXT,
    "invoiceNumber" TEXT,
    "invoiceDate" DATETIME,
    "dueDate" DATETIME,
    "totalAmount" REAL,
    "netAmount" REAL,
    "vatAmount" REAL,
    "vatRate" REAL,
    "ocrText" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processingError" TEXT,
    "booked" BOOLEAN NOT NULL DEFAULT false,
    "skr03Account" TEXT,
    "bookingText" TEXT,
    "companyId" TEXT NOT NULL,
    "creditorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "invoices_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invoices_creditorId_fkey" FOREIGN KEY ("creditorId") REFERENCES "creditors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_invoices" ("booked", "bookingText", "companyId", "createdAt", "dueDate", "filePath", "fileSize", "filename", "id", "invoiceDate", "invoiceNumber", "mimeType", "netAmount", "ocrText", "originalName", "processed", "processingError", "skr03Account", "supplierName", "supplierTaxId", "totalAmount", "updatedAt", "vatAmount", "vatRate") SELECT "booked", "bookingText", "companyId", "createdAt", "dueDate", "filePath", "fileSize", "filename", "id", "invoiceDate", "invoiceNumber", "mimeType", "netAmount", "ocrText", "originalName", "processed", "processingError", "skr03Account", "supplierName", "supplierTaxId", "totalAmount", "updatedAt", "vatAmount", "vatRate" FROM "invoices";
DROP TABLE "invoices";
ALTER TABLE "new_invoices" RENAME TO "invoices";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "creditors_ustId_key" ON "creditors"("ustId");
