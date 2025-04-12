/*
  Warnings:

  - Added the required column `complexity` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Made the column `yearPublished` on table `Game` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "complexity" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "yearPublished" SET NOT NULL;
