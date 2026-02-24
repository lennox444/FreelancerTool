-- AddColumn: isKleinunternehmer to users table
ALTER TABLE "users" ADD COLUMN "isKleinunternehmer" BOOLEAN NOT NULL DEFAULT false;
