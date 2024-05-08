/*
  Warnings:

  - The `donated_at` column on the `BookCopy` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "BookCopy"
  ADD COLUMN "donated_by_id" TEXT,
  DROP COLUMN "donated_at", -- was TEXT, should have been TIMESTAMPTZ
  ADD COLUMN "donated_at" TIMESTAMPTZ;

-- AddForeignKey
ALTER TABLE "BookCopy" ADD CONSTRAINT "BookCopy_donated_by_id_fkey" FOREIGN KEY ("donated_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
