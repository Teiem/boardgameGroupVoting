import prisma from "$lib/prisma";
import type { AvailableGame, AvailableUser } from "@prisma/client";

export const setVotes = async (userId: AvailableUser["id"], votes: AvailableGame["id"][]) => {
  await prisma.userGameVote.deleteMany({
    where: {
      userId,
    },
  });

  await prisma.userGameVote.createMany({
    data: votes.map((availableGameId, rank) => ({
      userId,
      availableGameId,
      rank,
    })),
  });
};