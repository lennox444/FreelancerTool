-- AlterTable: Add Stripe Connect fields to users
ALTER TABLE "users" ADD COLUMN "stripeConnectAccountId" TEXT;
ALTER TABLE "users" ADD CONSTRAINT "users_stripeConnectAccountId_key" UNIQUE ("stripeConnectAccountId");
ALTER TABLE "users" ADD COLUMN "stripeConnectEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Add online payment flag to invoices
ALTER TABLE "invoices" ADD COLUMN "onlinePaymentEnabled" BOOLEAN NOT NULL DEFAULT false;
