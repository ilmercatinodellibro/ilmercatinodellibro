/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - The values [USER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- AlterEnum
BEGIN;
DROP TYPE "Role";
CREATE TYPE "Role" AS ENUM ('OPERATOR', 'ADMIN');
COMMIT;

-- CreateTable
CREATE TABLE "LocationMember" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "retail_location_id" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "LocationMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LocationMember_user_id_retail_location_id_key" ON "LocationMember"("user_id", "retail_location_id");

-- AddForeignKey
ALTER TABLE "LocationMember" ADD CONSTRAINT "LocationMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationMember" ADD CONSTRAINT "LocationMember_retail_location_id_fkey" FOREIGN KEY ("retail_location_id") REFERENCES "RetailLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
