/*
  Warnings:

  - Added the required column `retail_location_id` to the `Cart` table without a default value. This is not possible if the table is not empty.
*/
-- DropIndex
DROP INDEX "Cart_user_id_key";

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN "retail_location_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cart_user_id_retail_location_id_key" ON "Cart"("user_id", "retail_location_id");

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_retail_location_id_fkey" FOREIGN KEY ("retail_location_id") REFERENCES "RetailLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
