/*
  Warnings:
  - A unique constraint covering the columns `[user_id,book_id,deleted_at]` on the table `BookRequest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,book_id,deleted_at]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.
*/

-- `NULLS NOT DISTINCT` was added manually, otherwise NULL values will be considered all unique, which defeats the purpose of the constraint

-- CreateIndex
CREATE UNIQUE INDEX "BookRequest_user_id_book_id_deleted_at_key" ON "BookRequest"("user_id", "book_id", "deleted_at") NULLS NOT DISTINCT;

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_user_id_book_id_deleted_at_key" ON "Reservation"("user_id", "book_id", "deleted_at") NULLS NOT DISTINCT;
