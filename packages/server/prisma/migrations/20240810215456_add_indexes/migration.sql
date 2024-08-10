/*
  Warnings:

  - A unique constraint covering the columns `[isbn_code,retail_location_id]` on the table `Book` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_code_retail_location_id_key" ON "Book"("isbn_code", "retail_location_id");

-- CreateIndex
CREATE INDEX "BookCopy_book_id_idx" ON "BookCopy" USING HASH ("book_id");
