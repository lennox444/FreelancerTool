ALTER TABLE "expenses" ADD COLUMN "projectId" TEXT;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "expenses_projectId_ownerId_idx" ON "expenses"("projectId", "ownerId");
