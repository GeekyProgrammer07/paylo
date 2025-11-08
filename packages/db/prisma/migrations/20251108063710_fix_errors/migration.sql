/*
  Warnings:

  - You are about to drop the column `uuid` on the `Balance` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Balance" DROP CONSTRAINT "Balance_userId_uuid_fkey";

-- DropIndex
DROP INDEX "public"."Balance_userId_uuid_key";

-- AlterTable
ALTER TABLE "Balance" DROP COLUMN "uuid";

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
