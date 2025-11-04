/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `Balance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `Merchant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `OnRampTransaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - The required column `uuid` was added to the `Balance` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `uuid` was added to the `Merchant` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `uuid` was added to the `OnRampTransaction` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `uuid` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Balance" ADD COLUMN     "uuid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "uuid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "OnRampTransaction" ADD COLUMN     "uuid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "uuid" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Balance_uuid_key" ON "Balance"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_uuid_key" ON "Merchant"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "OnRampTransaction_uuid_key" ON "OnRampTransaction"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");
