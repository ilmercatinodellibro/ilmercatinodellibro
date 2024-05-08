-- AlterTable
ALTER TABLE "BookCopy"
  ADD COLUMN "refunded_at" TIMESTAMPTZ,
  ADD COLUMN "refunded_by_id" TEXT;

-- AddForeignKey
ALTER TABLE "BookCopy" ADD CONSTRAINT "BookCopy_refunded_by_id_fkey" FOREIGN KEY ("refunded_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
