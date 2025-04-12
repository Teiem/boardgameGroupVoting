/*
  Warnings:

  - The primary key for the `UserGameVote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `gameId` on the `UserGameVote` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `UserGameVote` table. All the data in the column will be lost.
  - Added the required column `availableGameId` to the `UserGameVote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rank` to the `UserGameVote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `UserGameVote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserGameVote" DROP CONSTRAINT "UserGameVote_ownerId_fkey";

-- AlterTable
ALTER TABLE "UserGameVote" DROP CONSTRAINT "UserGameVote_pkey",
DROP COLUMN "gameId",
DROP COLUMN "ownerId",
ADD COLUMN     "availableGameId" TEXT NOT NULL,
ADD COLUMN     "rank" INTEGER NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "UserGameVote_pkey" PRIMARY KEY ("userId", "availableGameId");

-- AddForeignKey
ALTER TABLE "UserGameVote" ADD CONSTRAINT "UserGameVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AvailableUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameVote" ADD CONSTRAINT "UserGameVote_availableGameId_fkey" FOREIGN KEY ("availableGameId") REFERENCES "AvailableGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;
