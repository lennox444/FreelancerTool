-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('SOFTWARE', 'HARDWARE', 'TRAVEL', 'MARKETING', 'OFFICE', 'TRAINING', 'OTHER');

-- CreateEnum
CREATE TYPE "RecurringInterval" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- AlterTable invoices: add new columns
ALTER TABLE "invoices" ADD COLUMN "publicToken" TEXT;
ALTER TABLE "invoices" ADD COLUMN "dunningLevel" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "invoices" ADD COLUMN "lastDunningDate" TIMESTAMP(3);
ALTER TABLE "invoices" ADD COLUMN "isRecurring" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "invoices" ADD COLUMN "recurringInterval" "RecurringInterval";
ALTER TABLE "invoices" ADD COLUMN "recurringStartDate" TIMESTAMP(3);
ALTER TABLE "invoices" ADD COLUMN "recurringEndDate" TIMESTAMP(3);
ALTER TABLE "invoices" ADD COLUMN "nextInvoiceDate" TIMESTAMP(3);
ALTER TABLE "invoices" ADD COLUMN "parentInvoiceId" TEXT;

-- Populate publicToken for existing invoices
UPDATE "invoices" SET "publicToken" = gen_random_uuid()::text WHERE "publicToken" IS NULL;

-- CreateIndex for publicToken
CREATE UNIQUE INDEX "invoices_publicToken_key" ON "invoices"("publicToken");
CREATE INDEX "invoices_publicToken_idx" ON "invoices"("publicToken");
CREATE INDEX "invoices_nextInvoiceDate_idx" ON "invoices"("nextInvoiceDate");

-- CreateTable quotes
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "projectId" TEXT,
    "quoteNumber" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "convertedToInvoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex quotes
CREATE UNIQUE INDEX "quotes_convertedToInvoiceId_key" ON "quotes"("convertedToInvoiceId");
CREATE INDEX "quotes_ownerId_idx" ON "quotes"("ownerId");
CREATE INDEX "quotes_customerId_ownerId_idx" ON "quotes"("customerId", "ownerId");
CREATE INDEX "quotes_status_ownerId_idx" ON "quotes"("status", "ownerId");

-- AddForeignKey quotes
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable expenses
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL DEFAULT 'OTHER',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex expenses
CREATE INDEX "expenses_ownerId_idx" ON "expenses"("ownerId");
CREATE INDEX "expenses_category_ownerId_idx" ON "expenses"("category", "ownerId");
CREATE INDEX "expenses_date_ownerId_idx" ON "expenses"("date", "ownerId");

-- AddForeignKey expenses
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
