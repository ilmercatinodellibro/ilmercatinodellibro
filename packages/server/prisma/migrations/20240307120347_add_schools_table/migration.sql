-- CreateTable
CREATE TABLE "School" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "province_code" TEXT NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("code")
);
