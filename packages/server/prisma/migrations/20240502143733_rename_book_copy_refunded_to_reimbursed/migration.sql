-- AlterTable
ALTER TABLE "BookCopy" RENAME COLUMN "refunded_at" TO "reimbursed_at";
ALTER TABLE "BookCopy" RENAME COLUMN "refunded_by_id" TO "reimbursed_by_id";
ALTER TABLE "BookCopy" RENAME CONSTRAINT "BookCopy_refunded_by_id_fkey" TO "BookCopy_reimbursed_by_id_fkey";
