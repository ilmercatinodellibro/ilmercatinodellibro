/*
  Warnings:

  - The primary key for the `FederatedUser` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "FederatedUser" DROP CONSTRAINT "FederatedUser_pkey";
