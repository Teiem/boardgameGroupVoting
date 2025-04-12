import prisma from "$lib/prisma";
import type { AvailableGame, AvailableUser, Game, Prisma } from "@prisma/client";

export const DBSetVotes = async (userId: AvailableUser["id"], votes: AvailableGame["id"][]) => {
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

export const getUserVotes = async () => {
	const votes = await prisma.userGameVote.findMany({
		select: {
			userId: true,
      availableUser: {
        select: {
          name: true,
        }
      },
			availableGame: {
				select: {
					id: true,
				},
			},
		},
	});

	return Object.fromEntries(
		Object.entries( //
			Object.groupBy(votes, vote => vote.userId),
		).map(([userId, votes]) => [userId, {
      votes: votes!.map(vote => vote.availableGame.id),
      name: votes![0].availableUser.name,
    }]),
	) as Record<AvailableUser["id"], {
    name: string,
    votes: Game["id"][],
  }>;
};

export const DBAddAvailableGame = async (_availableGame: Prisma.AvailableGameUncheckedCreateInput, _game: Prisma.GameUncheckedCreateInput) => {
	const game = await prisma.game.upsert({
		update: _game,
		create: _game,
		where: {
			id: _game.id,
		},
	});

	const availableGame = await prisma.availableGame.create({
		data: _availableGame,
	});

	return {
		...availableGame,
		game,
	};
};

export const DBUpdateAvailableGameAndGame = async (
	_availableGame: Prisma.AvailableGameUncheckedUpdateInput & Pick<Prisma.AvailableGameUncheckedCreateInput, "id">,
	_game: Prisma.GameUncheckedUpdateInput & Pick<Prisma.GameUncheckedCreateInput, "id">,
) => {
	const game = await prisma.game.update({
		data: {
			name: _game.name,
			minPlayers: _game.minPlayers,
			maxPlayers: _game.maxPlayers,
			minDuration: _game.minDuration,
			maxDuration: _game.maxDuration,
			description: _game.description,
			thumbnail: _game.thumbnail,
			yearPublished: _game.yearPublished,
			rating: _game.rating,
			complexity: _game.complexity,
		},
		where: {
			id: _game.id,
		},
	});

	const availableGame = await prisma.availableGame.update({
		data: {
			ownerId: _availableGame.ownerId,
			isPromoted: _availableGame.isPromoted,
		},
		where: {
			id: _availableGame.id,
		},
	});

	return {
		...availableGame,
		game,
	};
};

export const DBDeleteAvailableGame = async (id: AvailableGame["id"]) => {
	await prisma.availableGame.delete({
		where: {
			id,
		},
	});
};

export const DBSoftDeleteAvailableGame = async (id: AvailableGame["id"]) => {
	await prisma.availableGame.update({
		where: {
			id,
		},
		data: {
			isDeleted: true,
		},
	});
};

export const DBRestoreAvailableGame = async (id: AvailableGame["id"]) => {
	await prisma.availableGame.update({
		where: {
			id,
		},
		data: {
			isDeleted: false,
		}
	});
};

export const DBGetAvailableGames = async (includeDeleted: boolean = false) => {
	const availableGames = await prisma.availableGame.findMany({
		where: includeDeleted ? undefined : { isDeleted: false },
		include: {
			game: true,
		},
	});

	return availableGames;
};

export const DBGetUserNameFromId = (id: AvailableUser["id"]) => {
  return prisma.availableUser.findUnique({
    select: {
      name: true,
    },
    where: {
      id,
    },
  });
}

export const DBDeleteUser = (userId: AvailableUser["id"]) => {
  return prisma.availableUser.delete({
    where: {
      id: userId,
    },
  });
};