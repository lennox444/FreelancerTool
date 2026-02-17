/*
  Warnings:

  - A unique constraint covering the columns `[email,ownerId]` on the table `customers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "FreelancerVertical" AS ENUM ('DESIGNER', 'DEVELOPER', 'CONSULTANT', 'MARKETING_CONTENT', 'PHOTOGRAPHER_VIDEOGRAPHER', 'OTHER');

-- CreateEnum
CREATE TYPE "CurrentWorkflow" AS ENUM ('EXCEL_SHEETS', 'WORD_DOCUMENTS', 'OTHER_SOFTWARE', 'UNORGANIZED');

-- CreateEnum
CREATE TYPE "BusinessStage" AS ENUM ('JUST_STARTED', 'GROWING', 'ESTABLISHED', 'SIDE_BUSINESS');

-- CreateEnum
CREATE TYPE "AcquisitionChannel" AS ENUM ('LINKEDIN', 'REDDIT', 'FACEBOOK_GROUP', 'REFERRAL', 'GOOGLE_SEARCH', 'OTHER');

-- CreateEnum
CREATE TYPE "OnboardingEventType" AS ENUM ('STEP_VIEWED', 'STEP_COMPLETED', 'STEP_SKIPPED', 'ONBOARDING_STARTED', 'ONBOARDING_COMPLETED', 'ONBOARDING_ABANDONED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- DropIndex
DROP INDEX "customers_email_ownerId_idx";

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "projectId" TEXT;

-- CreateTable
CREATE TABLE "onboarding_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vertical" "FreelancerVertical",
    "currentWorkflow" "CurrentWorkflow",
    "businessStage" "BusinessStage",
    "acquisitionChannel" "AcquisitionChannel",
    "acquisitionChannelOther" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "completedAt" TIMESTAMP(3),
    "additionalData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" "OnboardingEventType" NOT NULL,
    "stepNumber" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboarding_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "customerId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "budget" DECIMAL(10,2),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entries" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "projectId" TEXT,
    "description" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "pauseDuration" INTEGER NOT NULL DEFAULT 0,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_profiles_userId_key" ON "onboarding_profiles"("userId");

-- CreateIndex
CREATE INDEX "onboarding_profiles_userId_idx" ON "onboarding_profiles"("userId");

-- CreateIndex
CREATE INDEX "onboarding_profiles_vertical_idx" ON "onboarding_profiles"("vertical");

-- CreateIndex
CREATE INDEX "onboarding_profiles_acquisitionChannel_idx" ON "onboarding_profiles"("acquisitionChannel");

-- CreateIndex
CREATE INDEX "onboarding_profiles_onboardingCompleted_idx" ON "onboarding_profiles"("onboardingCompleted");

-- CreateIndex
CREATE INDEX "onboarding_events_userId_eventType_idx" ON "onboarding_events"("userId", "eventType");

-- CreateIndex
CREATE INDEX "onboarding_events_eventType_createdAt_idx" ON "onboarding_events"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "projects_ownerId_idx" ON "projects"("ownerId");

-- CreateIndex
CREATE INDEX "projects_customerId_ownerId_idx" ON "projects"("customerId", "ownerId");

-- CreateIndex
CREATE INDEX "projects_status_ownerId_idx" ON "projects"("status", "ownerId");

-- CreateIndex
CREATE INDEX "projects_startDate_ownerId_idx" ON "projects"("startDate", "ownerId");

-- CreateIndex
CREATE INDEX "time_entries_ownerId_idx" ON "time_entries"("ownerId");

-- CreateIndex
CREATE INDEX "time_entries_projectId_ownerId_idx" ON "time_entries"("projectId", "ownerId");

-- CreateIndex
CREATE INDEX "time_entries_startTime_ownerId_idx" ON "time_entries"("startTime", "ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_ownerId_key" ON "customers"("email", "ownerId");

-- CreateIndex
CREATE INDEX "invoices_projectId_ownerId_idx" ON "invoices"("projectId", "ownerId");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_profiles" ADD CONSTRAINT "onboarding_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_events" ADD CONSTRAINT "onboarding_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
