import prisma from "$lib/prisma";
import type { Prisma } from "@prisma/client";

type UserId = string;
type GameId = string;

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export const DBSetVotes = async (userId: UserId, votes: GameId[]) => {
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
	) as Record<UserId, {
    name: string,
    votes: GameId[],
  }>;
};

export const DBAddAvailableGame = async (_availableGame: Prisma.AvailableGameCreateManyInput, _game: Prisma.GameCreateManyInput) => {
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
	_availableGame: Prisma.AvailableGameCreateManyInput & Pick<Prisma.AvailableGameCreateManyInput, "id">,
	_game: Prisma.GameCreateManyInput & Pick<Prisma.GameCreateManyInput, "id">,
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

export const DBDeleteAvailableGame = async (id: GameId) => {
	await prisma.availableGame.delete({
		where: {
			id,
		},
	});
};

export const DBSoftDeleteAvailableGame = async (id: GameId) => {
	await prisma.availableGame.update({
		where: {
			id,
		},
		data: {
			isDeleted: true,
		},
	});
};

export const DBRestoreAvailableGame = async (id: GameId) => {
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

export const DBGetUserNameFromId = (id: UserId) => {
  return prisma.availableUser.findUnique({
    select: {
      name: true,
    },
    where: {
      id,
    },
  });
}

export const DBDeleteUser = (userId: UserId) => {
  return prisma.availableUser.delete({
    where: {
      id: userId,
    },
  });
};