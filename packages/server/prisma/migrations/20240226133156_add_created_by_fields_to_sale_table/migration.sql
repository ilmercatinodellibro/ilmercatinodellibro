/*
  Warnings:

  - Added the required column `cart_created_by_id` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by_id` to the `Sale` table without a default value. This is not possible if the table is not empty.
*/
-- AlterTable
ALTER TABLE "Sale"
  ADD COLUMN "cart_created_by_id" TEXT NOT NULL,
  ADD COLUMN "created_by_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_cart_created_by_id_fkey" FOREIGN KEY ("cart_created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
