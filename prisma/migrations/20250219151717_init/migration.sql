-- CreateTable
CREATE TABLE "UserSession" (
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("sessionId")
);

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AvailableUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
