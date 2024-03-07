/*
  Warnings:

  - Added the required column `request_id` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "request_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "BookRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
