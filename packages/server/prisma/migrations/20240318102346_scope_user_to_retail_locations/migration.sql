/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- CreateTable
CREATE TABLE "LocationMember" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "retail_location_id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "LocationMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LocationMember_user_id_retail_location_id_key" ON "LocationMember"("user_id", "retail_location_id");

-- AddForeignKey
ALTER TABLE "LocationMember" ADD CONSTRAINT "LocationMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationMember" ADD CONSTRAINT "LocationMember_retail_location_id_fkey" FOREIGN KEY ("retail_location_id") REFERENCES "RetailLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
