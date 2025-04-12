/*
  Warnings:

  - You are about to drop the column `availableUserId` on the `AvailableGame` table. All the data in the column will be lost.
  - The primary key for the `UserGameVote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `availableUserId` on the `UserGameVote` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `AvailableGame` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `UserGameVote` table without a default value. This is not possible if the table is not empty.

*/

DELETE FROM "AvailableUser";

-- DropForeignKey
ALTER TABLE "AvailableGame" DROP CONSTRAINT "AvailableGame_availableUserId_fkey";

-- DropForeignKey
ALTER TABLE "UserGameVote" DROP CONSTRAINT "UserGameVote_availableUserId_fkey";

-- AlterTable
ALTER TABLE "AvailableGame" DROP COLUMN "availableUserId",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserGameVote" DROP CONSTRAINT "UserGameVote_pkey",
DROP COLUMN "availableUserId",
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD CONSTRAINT "UserGameVote_pkey" PRIMARY KEY ("ownerId", "gameId");

-- AddForeignKey
ALTER TABLE "AvailableGame" ADD CONSTRAINT "AvailableGame_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "AvailableUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameVote" ADD CONSTRAINT "UserGameVote_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "AvailableUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
