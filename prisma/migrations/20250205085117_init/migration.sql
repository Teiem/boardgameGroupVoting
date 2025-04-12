/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Instance" (
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instance_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "AvailableUser" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailableUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailableGame" (
    "availableUserId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "isPromoted" BOOLEAN NOT NULL,
    "isOthersAllowed" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "instanceName" TEXT,

    CONSTRAINT "AvailableGame_pkey" PRIMARY KEY ("availableUserId","gameId")
);

-- CreateTable
CREATE TABLE "UserGameVote" (
    "availableUserId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGameVote_pkey" PRIMARY KEY ("availableUserId","gameId")
);

-- CreateTable
CREATE TABLE "UserGroup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGroupMembership" (
    "userGroupId" TEXT NOT NULL,
    "availableUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGroupMembership_pkey" PRIMARY KEY ("userGroupId","availableUserId")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minPlayers" INTEGER NOT NULL,
    "maxPlayers" INTEGER NOT NULL,
    "duration" INTEGER,
    "description" TEXT,
    "bggHref" TEXT,
    "imageHref" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Instance_name_key" ON "Instance"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AvailableUser_instanceId_name_key" ON "AvailableUser"("instanceId", "name");

-- AddForeignKey
ALTER TABLE "AvailableUser" ADD CONSTRAINT "AvailableUser_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailableGame" ADD CONSTRAINT "AvailableGame_availableUserId_fkey" FOREIGN KEY ("availableUserId") REFERENCES "AvailableUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameVote" ADD CONSTRAINT "UserGameVote_availableUserId_fkey" FOREIGN KEY ("availableUserId") REFERENCES "AvailableUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroupMembership" ADD CONSTRAINT "UserGroupMembership_userGroupId_fkey" FOREIGN KEY ("userGroupId") REFERENCES "UserGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroupMembership" ADD CONSTRAINT "UserGroupMembership_availableUserId_fkey" FOREIGN KEY ("availableUserId") REFERENCES "AvailableUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
