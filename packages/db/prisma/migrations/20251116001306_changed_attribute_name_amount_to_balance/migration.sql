/*
  Warnings:

  - You are about to drop the column `amount` on the `Balance` table. All the data in the column will be lost.
  - Added the required column `balance` to the `Balance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Balance" DROP COLUMN "amount",
ADD COLUMN     "balance" INTEGER NOT NULL;
