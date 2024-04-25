-- CreateTable
CREATE TABLE "RequestQueue" (
    "id" TEXT NOT NULL,
    "book_id" UUID NOT NULL,
    "current_request_id" TEXT NOT NULL,
    "last_checked_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RequestQueue_book_id_key" ON "RequestQueue"("book_id");

-- CreateIndex
CREATE UNIQUE INDEX "RequestQueue_current_request_id_key" ON "RequestQueue"("current_request_id");

-- AddForeignKey
ALTER TABLE "RequestQueue" ADD CONSTRAINT "RequestQueue_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestQueue" ADD CONSTRAINT "RequestQueue_current_request_id_fkey" FOREIGN KEY ("current_request_id") REFERENCES "BookRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
