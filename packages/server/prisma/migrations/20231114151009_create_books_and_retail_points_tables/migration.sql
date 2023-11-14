-- CreateTable
CREATE TABLE "RetailLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registration_enabled" BOOLEAN NOT NULL DEFAULT false,
    "pay_off_enabled" BOOLEAN NOT NULL DEFAULT false,
    "full_address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL DEFAULT '',
    "facebook_link" TEXT NOT NULL DEFAULT '',
    "instagram_link" TEXT NOT NULL DEFAULT '',
    "who_are_we_content" TEXT NOT NULL DEFAULT '',
    "join_us_content" TEXT NOT NULL DEFAULT '',
    "buy_rate" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "sell_rate" DOUBLE PRECISION NOT NULL DEFAULT 55,
    "max_booking_days" INTEGER NOT NULL DEFAULT 7,
    "warehouse_max_block_size" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "RetailLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "isbn_code" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "authors_full_name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_price" DOUBLE PRECISION NOT NULL,
    "publisher_name" TEXT NOT NULL,
    "retail_location_id" TEXT NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RetailLocation_email_key" ON "RetailLocation"("email");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_retail_location_id_fkey" FOREIGN KEY ("retail_location_id") REFERENCES "RetailLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
