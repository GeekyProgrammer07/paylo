-- DropForeignKey
ALTER TABLE "public"."OnRampTransaction" DROP CONSTRAINT "OnRampTransaction_userId_fkey";

-- AddForeignKey
ALTER TABLE "OnRampTransaction" ADD CONSTRAINT "OnRampTransaction_userId_uuid_fkey" FOREIGN KEY ("userId", "uuid") REFERENCES "User"("id", "uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
