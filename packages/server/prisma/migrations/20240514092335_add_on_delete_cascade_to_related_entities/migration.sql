-- DropForeignKey
ALTER TABLE "BookCopy" DROP CONSTRAINT "BookCopy_book_id_fkey";

-- DropForeignKey
ALTER TABLE "BookRequest" DROP CONSTRAINT "BookRequest_book_id_fkey";

-- DropForeignKey
ALTER TABLE "RequestQueue" DROP CONSTRAINT "RequestQueue_book_id_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_book_id_fkey";

-- AddForeignKey
ALTER TABLE "BookCopy" ADD CONSTRAINT "BookCopy_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookRequest" ADD CONSTRAINT "BookRequest_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestQueue" ADD CONSTRAINT "RequestQueue_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
