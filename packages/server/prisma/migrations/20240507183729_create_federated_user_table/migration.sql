-- CreateEnum
CREATE TYPE "FederationProvider" AS ENUM ('FACEBOOK');

-- CreateTable
CREATE TABLE "FederatedUser" (
    "provider" "FederationProvider" NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "FederatedUser_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FederatedUser_provider_user_id_key" ON "FederatedUser"("provider", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "FederatedUser_provider_provider_user_id_key" ON "FederatedUser"("provider", "provider_user_id");

-- AddForeignKey
ALTER TABLE "FederatedUser" ADD CONSTRAINT "FederatedUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
