-- Add invoiceId to time_entries so time entries can be linked to invoices
ALTER TABLE "time_entries" ADD COLUMN "invoiceId" TEXT;

-- Foreign key constraint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_invoiceId_fkey"
  FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Index for fast lookups by invoice
CREATE INDEX "time_entries_invoiceId_idx" ON "time_entries"("invoiceId");
