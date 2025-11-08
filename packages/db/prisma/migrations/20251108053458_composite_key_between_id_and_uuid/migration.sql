/*
  Warnings:

  - A unique constraint covering the columns `[userId,uuid]` on the table `Balance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,uuid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uuid` to the `OnRampTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Balance" DROP CONSTRAINT "Balance_userId_fkey";

-- DropIndex
DROP INDEX "public"."Balance_uuid_key";

-- AlterTable
ALTER TABLE "OnRampTransaction" ADD COLUMN     "uuid" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Balance_userId_uuid_key" ON "Balance"("userId", "uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_uuid_key" ON "User"("id", "uuid");

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_userId_uuid_fkey" FOREIGN KEY ("userId", "uuid") REFERENCES "User"("id", "uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
