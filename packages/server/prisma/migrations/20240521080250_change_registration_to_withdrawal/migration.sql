/*
  Warnings:

  - The values [REGISTRATION] on the enum `ReceiptType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReceiptType_new" AS ENUM ('PURCHASE', 'WITHDRAWAL');
ALTER TABLE "Receipt" ALTER COLUMN "type" TYPE "ReceiptType_new" USING ("type"::text::"ReceiptType_new");
ALTER TYPE "ReceiptType" RENAME TO "ReceiptType_old";
ALTER TYPE "ReceiptType_new" RENAME TO "ReceiptType";
DROP TYPE "ReceiptType_old";
COMMIT;
