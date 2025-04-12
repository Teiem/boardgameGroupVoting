/*
  Warnings:

  - You are about to drop the `UserGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserGroupMembership` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AvailableGame" DROP CONSTRAINT "AvailableGame_availableUserId_fkey";

-- DropForeignKey
ALTER TABLE "AvailableUser" DROP CONSTRAINT "AvailableUser_instanceId_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_instanceId_fkey";

-- DropForeignKey
ALTER TABLE "UserGameVote" DROP CONSTRAINT "UserGameVote_availableUserId_fkey";

-- DropForeignKey
ALTER TABLE "UserGroupMembership" DROP CONSTRAINT "UserGroupMembership_availableUserId_fkey";

-- DropForeignKey
ALTER TABLE "UserGroupMembership" DROP CONSTRAINT "UserGroupMembership_userGroupId_fkey";

-- AlterTable
ALTER TABLE "AvailableUser" ADD COLUMN     "wantsToPlayWithUserId" TEXT;

-- DropTable
DROP TABLE "UserGroup";

-- DropTable
DROP TABLE "UserGroupMembership";

-- AddForeignKey
ALTER TABLE "AvailableUser" ADD CONSTRAINT "AvailableUser_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailableUser" ADD CONSTRAINT "AvailableUser_wantsToPlayWithUserId_fkey" FOREIGN KEY ("wantsToPlayWithUserId") REFERENCES "AvailableUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailableGame" ADD CONSTRAINT "AvailableGame_availableUserId_fkey" FOREIGN KEY ("availableUserId") REFERENCES "AvailableUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameVote" ADD CONSTRAINT "UserGameVote_availableUserId_fkey" FOREIGN KEY ("availableUserId") REFERENCES "AvailableUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("name") ON DELETE CASCADE ON UPDATE CASCADE;
