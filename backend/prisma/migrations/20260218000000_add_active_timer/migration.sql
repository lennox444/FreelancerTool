-- AlterTable: Add active timer tracking fields to time_entries
ALTER TABLE "time_entries" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "time_entries" ADD COLUMN "pauseStartedAt" TIMESTAMP(3);
