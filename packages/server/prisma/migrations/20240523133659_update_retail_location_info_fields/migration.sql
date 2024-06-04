/*
  Warnings:

  - You are about to drop the column `faq_content` on the `RetailLocation` table. All the data in the column will be lost.
  - You are about to drop the column `join_us_content` on the `RetailLocation` table. All the data in the column will be lost.
  - You are about to drop the column `who_are_we_content` on the `RetailLocation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RetailLocation" DROP COLUMN "faq_content",
DROP COLUMN "join_us_content",
DROP COLUMN "who_are_we_content",
ADD COLUMN     "info_pages_content" JSONB;
