/*
  Warnings:

  - You are about to drop the column `bggHref` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `imageHref` on the `Game` table. All the data in the column will be lost.
  - Added the required column `maxDuration` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minDuration` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnail` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearPublished` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Game` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "bggHref",
DROP COLUMN "duration",
DROP COLUMN "imageHref",
ADD COLUMN     "maxDuration" INTEGER NOT NULL,
ADD COLUMN     "minDuration" INTEGER NOT NULL,
ADD COLUMN     "thumbnail" TEXT NOT NULL,
ADD COLUMN     "yearPublished" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;
