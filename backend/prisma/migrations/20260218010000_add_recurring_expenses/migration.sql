-- AddColumn: recurring fields for Expense (Abonnements)
ALTER TABLE "expenses" ADD COLUMN "isRecurring" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "expenses" ADD COLUMN "recurringInterval" "RecurringInterval";
ALTER TABLE "expenses" ADD COLUMN "recurringStartDate" TIMESTAMP(3);
ALTER TABLE "expenses" ADD COLUMN "recurringEndDate" TIMESTAMP(3);
ALTER TABLE "expenses" ADD COLUMN "nextExpenseDate" TIMESTAMP(3);
ALTER TABLE "expenses" ADD COLUMN "parentExpenseId" TEXT;
CREATE INDEX "expenses_nextExpenseDate_idx" ON "expenses"("nextExpenseDate");
