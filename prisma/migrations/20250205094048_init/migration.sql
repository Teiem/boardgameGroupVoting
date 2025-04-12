-- AddForeignKey
ALTER TABLE "AvailableGame" ADD CONSTRAINT "AvailableGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
