-- AlterTable
ALTER TABLE "BookCopy" ADD COLUMN     "settled_at" TIMESTAMPTZ,
ADD COLUMN     "settled_by_id" TEXT;

-- AddForeignKey
ALTER TABLE "BookCopy" ADD CONSTRAINT "BookCopy_settled_by_id_fkey" FOREIGN KEY ("settled_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
