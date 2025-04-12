import { findBestPlayerDistribution, type PlayerScores } from "./triple";

export type GameId = string & {};
export type UserId = string & {};

type GameInfo = Readonly<
	Record<
		GameId,
		{
			min: number;
			max: number;
		}
	>
>;

export type UserGroupVotes = Readonly<{
	groupId: UserId;
	votes: GameId[];
	/** 1x per person - 0.5 if more than 1 */
	// votingPower: number;
	memberCount: number;
}>;

export type UserGroupVotesWithWeights = Readonly<{
	votesWithWeights: Record<GameId, number>;
}> &
	UserGroupVotes;

// type UserGroupScores = {
//   gameId: GameId;
//   score: number;
// }

/*
  https://www.geogebra.org/calculator/r49jhjj9

  f(x) = 1 / x^(1 / gameCount) * (2 - 1 / gameCount)

  explained:
    1/x - the lower on the list, the lower the score
    x^(1 / gameCount) - the more games, the flatter the curve gets
    (2 - 1 / gameCount) - factor to reward adding more games, at most a 2x increase. e.g. for 10 games its a 1.866x increase for the first game
*/

/*
  Lets assume 20 UserGroupVotes with 10 games each.
  10^20 possible combinations...
*/

// const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const takeRandom = <T>(arr: readonly T[]): [T, T[]] => {
	const index = Math.floor(Math.random() * arr.length);
	return [arr[index], arr.slice(0, index).concat(arr.slice(index + 1))];
};

const takeRandomWeighted = <T extends { weight: number }>(arr: readonly T[]): [T, T[]] => {
	const totalWeight = arr.reduce((acc, { weight }) => acc + weight, 0);
	const random = Math.random() * totalWeight;

	let sum = 0;
	for (const el of arr) {
		sum += el.weight;
		if (random <= sum) {
			return [el, arr.filter(e => e !== el)];
		}
	}

	console.info("arr", arr, sum, random);
	throw new Error("takeRandomWeighted - Should not happen");
};

const takeRandomObject = <T extends Record<string, unknown>>(obj: T) => {
	const keys = Object.keys(obj);
	const index = Math.floor(Math.random() * keys.length);
	const key = keys[index];
	const { [key]: removed, ...remaining } = obj;

	// return [[key, removed], remaining] as [[string, T[keyof T]], T];
	return [{ key, value: removed }, remaining] as [{ key: string; value: T[keyof T] }, T];
};

// const takeRandomWeightedObject = <T extends Record<string, number>>(obj: T) => {
// 	const entries = Object.entries(obj);

// 	return takeRandomWeighted(entries.map(([key, value]) => ({ key, weight: value })));
// };

// const takeFirstN = <T>(arr: T[], n: number) => [arr.slice(0, n), arr.slice(n)];

// (x + 1) to account for 0-based index
const addWeightsToVotes = <T>(votes: T[]) => votes.map((vote, x) => ({ vote, weight: (1 / (x + 1) ** (1 / votes.length)) * (2 - 1 / votes.length) }));

const weightUserGroupVotes = (userGroupVotes: UserGroupVotes[]) =>
	userGroupVotes.map(
		({ votes, memberCount, groupId }): UserGroupVotesWithWeights =>
			Object.freeze({
				groupId,
				votes,
				memberCount,
				votesWithWeights: Object.fromEntries(
					addWeightsToVotes(votes).map(vote => [vote.vote, memberCount > 1 ? vote.weight * memberCount - 0.5 : vote.weight] as const),
				) as Record<GameId, number>,
			}),
	);

export const MAX_ITERATIONS = 10_000;

// I also considered a greedy approach based on possible score by game, but this should often enough also be able to find the same.
export const findDistribution = (userGroupVotes: UserGroupVotes[], gameInfo: GameInfo) => {
	const userGroupWeightedVotes = weightUserGroupVotes(userGroupVotes);

	return Array.from({ length: MAX_ITERATIONS })
		.map(() => {
			const unclaimedGames = { ...gameInfo };
			const playersWithoutGames = Object.fromEntries(userGroupWeightedVotes.map(obj => [obj.groupId, obj]));

			const result: [
				GameId,
				{
					scoreForGame: number;
					players: UserGroupVotesWithWeights[];
				},
			][] = [];

			while (Object.keys(playersWithoutGames).length > 0) {
				if (Object.keys(unclaimedGames).length === 0) return null;

				const [{ value: player }, remainingPlayers] = takeRandomObject(playersWithoutGames);

				const remainingFavoredGames = Object.entries(player.votesWithWeights)
					.filter(([gameId]) => unclaimedGames[gameId])
					.map(([gameId, weight]) => ({ key: gameId, weight }));

				const remainingGames = remainingFavoredGames.length !== 0 ? remainingFavoredGames : Object.keys(unclaimedGames).map(key => ({ key, weight: 1 }));

				const [{ key: gameId }] = takeRandomWeighted(remainingGames);

				const { min, max } = gameInfo[gameId];

				const remainingPlayersArray = Object.values(remainingPlayers);
				if (remainingPlayersArray.length < min - 1) return null;

				const { playersWithPreferenceForGame = [], playersWithoutPreferenceForGame = [] } = Object.groupBy(remainingPlayersArray, player =>
					player.votesWithWeights[gameId] > 0 ? "playersWithPreferenceForGame" : "playersWithoutPreferenceForGame",
				);

				const playersWithPreferenceForGameSorted = playersWithPreferenceForGame
					.map(player => ({
						...player,
						affinity: player.votesWithWeights[gameId],
					}))
					.sort((playerA, playerB) => playerB.affinity - playerA.affinity);

				// Those who have voted for fewer games will be put in to a game they haven't voted for first
				const playersWithoutPreferenceForGameSorted = playersWithoutPreferenceForGame.sort((playerA, playerB) => playerA.votes.length - playerB.votes.length);

				const playersForGame = [player];
				if (playersWithPreferenceForGameSorted.length > 0) playersForGame.push(...playersWithPreferenceForGameSorted.slice(0, max - 1));

				const missingPlayerCount = min - playersForGame.length;
				if (missingPlayerCount > 0) playersForGame.push(...playersWithoutPreferenceForGameSorted.slice(0, missingPlayerCount));

				result.push([
					gameId,
					{
						scoreForGame: scoreGame(gameId, playersForGame),
						players: playersForGame,
					},
				]);

				for (const { groupId } of playersForGame) {
					delete playersWithoutGames[groupId];
				}

				delete unclaimedGames[gameId];
			}

			return {
				score: result.reduce((acc, [_, { scoreForGame }]) => acc + scoreForGame, 0),
				result: Object.fromEntries(result),
			};
		})
		.filter(id => !!id)
		.sort((a, b) => b.score - a.score);
};

// const pairs = <T, U>(arr1: T[], arr2: U[]) => arr1.flatMap(a => arr2.map(b => [a, b] as const));
export const cross = <T>(arr: T[]) => arr.flatMap((a, i) => arr.slice(i + 1).map(b => [a, b] as const));

// note to self, [1, 2].sort((a, b) => a - b) sorts in ascending order, i.e. [1, 2]

export const checkForPlayerSwaps = (results: Record<GameId, UserGroupVotesWithWeights[]>) => {
	const gameSwapOpportunities = cross(Object.entries(results));

	let hasChanged = false;

	// TODO does not account for game sizes
	for (const [[gameAId, gameAPlayers], [gameBId, gameBPlayers]] of gameSwapOpportunities) {
		// How much more players would rather play gameB
		// at index 0 player who would get the most out of playing other game

		const [gameAPlayersSortedByHowMuchTheyRatherPlayGameB, gameBPlayersSortedByHowMuchTheyRatherPlayGameA] = [gameAPlayers, gameBPlayers].map(players =>
			players
				.map(player => ({
					...player,
					gainByPlayingGameB: (player.votesWithWeights[gameBId] ?? 0) - (player.votesWithWeights[gameAId] ?? 0),
				}))
				.sort((playerA, playerB) => playerA.gainByPlayingGameB - playerB.gainByPlayingGameB),
		);

		const allPlayersSortedByHowMuchTheyRatherPlayGameB = [...gameAPlayersSortedByHowMuchTheyRatherPlayGameB, ...gameBPlayersSortedByHowMuchTheyRatherPlayGameA]
			// TODO check if is sorted first for O(n) performance in most cases
			.sort((playerA, playerB) => playerA.gainByPlayingGameB - playerB.gainByPlayingGameB);

		const newGameAPlayers = allPlayersSortedByHowMuchTheyRatherPlayGameB.slice(0, gameAPlayers.length);
		const newGameBPlayers = allPlayersSortedByHowMuchTheyRatherPlayGameB.slice(gameAPlayers.length);

		const hasGameAPlayersChanged = newGameAPlayers.some((player, i) => player !== gameAPlayersSortedByHowMuchTheyRatherPlayGameB[i]);

		if (hasGameAPlayersChanged) {
			gameAPlayers.splice(0, gameAPlayers.length, ...newGameAPlayers.map(({ gainByPlayingGameB, ...el }) => el));
			gameBPlayers.splice(0, gameBPlayers.length, ...newGameBPlayers.map(({ gainByPlayingGameB, ...el }) => el));

			hasChanged = true;
		}
	}

	return {
		hasChanged,
		results,
	};
};

export const scoreGame = <T extends Pick<UserGroupVotesWithWeights, "votesWithWeights">>(gameId: GameId, userGroupVotesWithWeight: T[]) =>
	userGroupVotesWithWeight.reduce((acc, cur) => acc + (cur.votesWithWeights[gameId] ?? 0), 0);

export const checkForGameSwaps = (results: Record<GameId, UserGroupVotesWithWeights[]>, _gameInfo: GameInfo) => {
	let hasChanged = false;

	for (const [gameId, players] of Object.entries(results)) {
		const possibleGames = new Set(players.flatMap(player => player.votes).filter(gameId => !results[gameId]));

		let bestGame = gameId;
		let bestScore = scoreGame(gameId, players);

		for (const possibleGame of possibleGames) {
			const newScore = scoreGame(possibleGame, players);
			if (newScore > bestScore) {
				bestScore = newScore;
				bestGame = possibleGame;
			}
		}

		if (bestGame !== gameId) {
			// mutating results here is fine since the iterable is created before the loop and adding new entries to the object does not affect the iteration
			results[bestGame] = players;
			delete results[gameId];

			hasChanged = true;
		}
	}

	return {
		hasChanged,
		results,
	};
};

// with p being the number of players, this function would be called O(p^3) times
// with g being the number of games, this function would have a runtime of O(g^3 * p * ln(p))
// in total this function would have a runtime of O(p^3 * g^3*ln(p)). Assuming g >= p, i.e. everyone brings at least one game, we would have a runtime of O(p^7*ln(p)) ☠
// const optimizeTriple = () => { ... };

const inRange = (
	n: number,
	range: {
		min: number;
		max: number;
	},
) => n >= range.min && n <= range.max;

const MIN_DIFFERENCE = Number.EPSILON * 100;

export const optimizePair = (userGroupVotesWithWeights: UserGroupVotesWithWeights[], bestScoreYet: number, availableGames: GameId[], gameInfo: GameInfo) => {
	// Optimization:
	// Assume we already know it is possible to reach 100 points
	// if the best we can do is reach 90 points with one game
	// we can skip all games that have a score of 10 or less
	const possibleScoresPerGame = availableGames.map(gameId => {
		const score = scoreGame(gameId, userGroupVotesWithWeights);
		return { gameId, score };
	});

	const bestPossibleScorePerGame = Math.max(...possibleScoresPerGame.map(({ score }) => score));
	const maxPossiblePlayersPerGame = Math.max(...availableGames.map(gameId => gameInfo[gameId].max));

	let bestRunningResult:
		| {
				score: number;
				result: Record<
					GameId,
					{
						scoreForGame: number;
						players: UserGroupVotesWithWeights[];
					}
				>;
		  }
		| {
				score: number;
				result: null;
		  } = {
		score: bestScoreYet,
		result: null,
	};

	const computeViableGames = () => {
		const minScoreToReachWithSecondGame = bestRunningResult.score - bestPossibleScorePerGame;
		const minPlayersForPossibleGames = userGroupVotesWithWeights.length - maxPossiblePlayersPerGame;

		return possibleScoresPerGame
			.filter(({ score }) => score > minScoreToReachWithSecondGame)
			.filter(({ gameId }) => gameInfo[gameId].min >= minPlayersForPossibleGames)
			.map(({ gameId }) => gameId);
	};

	let viableGames = computeViableGames();

	loopGameA: for (let i1 = 0; i1 < viableGames.length; i1++) {
		const gameA = viableGames[i1];

		if (inRange(userGroupVotesWithWeights.length, gameInfo[gameA])) {
			const score = scoreGame(gameA, userGroupVotesWithWeights);
			if (score > bestRunningResult.score + MIN_DIFFERENCE) {
				bestRunningResult = {
					score,
					result: {
						[gameA]: {
							scoreForGame: score,
							players: userGroupVotesWithWeights,
						},
					},
				};

				const gamesAfterGameA = viableGames.slice(i1 + 1);
				// we might be able to skip more games now
				viableGames = computeViableGames();
				// index of current game might have changed, so we need to update i1 in case it a game was remove before it
				// gameA can also not have been removed since it is the game with the highest score
				i1 = viableGames.findIndex(gameId => gamesAfterGameA.includes(gameId));
				// we have removed all games that would have come after GameA
				if (i1 === -1) break loopGameA;
			}
		}

		loopGameB: for (let i2 = i1 + 1; i2 < viableGames.length; i2++) {
			const gameB = viableGames[i2];

			const minPossiblePlayers = gameInfo[gameA].min + gameInfo[gameB].min;
			const maxPossiblePlayers = gameInfo[gameA].max + gameInfo[gameB].max;

			if (!inRange(userGroupVotesWithWeights.length, { min: minPossiblePlayers, max: maxPossiblePlayers })) continue;

			// in the beginning negative affinity, so prefering a first, sort A -> B
			const playersSortedByAffinityForGameAOverB = userGroupVotesWithWeights
				.map(player => ({
					...player,
					affinity: (player.votesWithWeights[gameB] ?? 0) - (player.votesWithWeights[gameA] ?? 0),
				}))
				.sort((a, b) => a.affinity - b.affinity);

			const newGameAPlayers = playersSortedByAffinityForGameAOverB.splice(0, gameInfo[gameA].min);
			const newGameBPlayers = playersSortedByAffinityForGameAOverB.splice(playersSortedByAffinityForGameAOverB.length - gameInfo[gameB].min);

			while (playersSortedByAffinityForGameAOverB.length > 0) {
				if (gameInfo[gameA].max === newGameAPlayers.length) {
					newGameBPlayers.push(...playersSortedByAffinityForGameAOverB);
					break;
				}
				if (gameInfo[gameB].max === newGameBPlayers.length) {
					newGameAPlayers.push(...playersSortedByAffinityForGameAOverB);
					break;
				}

				const wantsMostInToGameA = playersSortedByAffinityForGameAOverB[0];
				const wantsMostInToGameB = playersSortedByAffinityForGameAOverB.at(-1)!;

				// debugger;
				if (Math.abs(wantsMostInToGameA.affinity) > Math.abs(wantsMostInToGameB.affinity)) {
					newGameAPlayers.push(playersSortedByAffinityForGameAOverB.shift()!);
				} else {
					newGameBPlayers.push(playersSortedByAffinityForGameAOverB.pop()!);
				}
			}
			const gameAScore = scoreGame(gameA, newGameAPlayers);
			const gameBScore = scoreGame(gameB, newGameBPlayers);
			const score = gameAScore + gameBScore;

			if (score > bestRunningResult.score + MIN_DIFFERENCE) {
				bestRunningResult = {
					score,
					result: {
						[gameA]: {
							scoreForGame: gameAScore,
							players: newGameAPlayers,
						},
						[gameB]: {
							scoreForGame: gameBScore,
							players: newGameBPlayers,
						},
					},
				};

				const gamesAfterGameA = viableGames.slice(i1 + 1);
				const gamesAfterGameB = gamesAfterGameA.slice(i2 + 1);
				viableGames = computeViableGames();

				i1 = viableGames.findIndex(gameId => gamesAfterGameA.includes(gameId));
				if (i1 === -1) break loopGameA;

				i2 = viableGames.findIndex(gameId => gamesAfterGameB.includes(gameId));
				if (i2 === -1) break loopGameB;
			}
		}
	}

	if (bestRunningResult.result) {
		return bestRunningResult;
	}
};

export const maxEntry = <T extends Record<PropertyKey, number>>(obj: T) => {
	let maxKey: keyof T | null = null;
	let max = -Infinity;

	for (const [key, value] of Object.entries(obj)) {
		if (value > max) {
			max = value;
			maxKey = key;
		}
	}

	return [maxKey, max] as const;
};

type MaybeResult =
	| {
			score: number;
			result: Record<
				GameId,
				{
					scoreForGame: number;
					players: UserGroupVotesWithWeights[];
				}
			>;
	  }
	| {
			score: number;
			result: null;
	  };

export const optimizeTriple = (userGroupVotesWithWeights: UserGroupVotesWithWeights[], bestScoreYet: number, availableGames: GameId[], gameInfo: GameInfo) => {
	const bestRunningResult = {
		score: bestScoreYet,
		result: null,
	} as MaybeResult;

	for (let i1 = 0; i1 < availableGames.length; i1++) {
		const gameA = availableGames[i1];
		for (let i2 = i1 + 1; i2 < availableGames.length; i2++) {
			const gameB = availableGames[i2];
			for (let i3 = i2 + 1; i3 < availableGames.length; i3++) {
				const gameC = availableGames[i3];

				// Assume that handling of merging three games in to two is handled elsewhere.
				const minPossiblePlayers = gameInfo[gameA].min + gameInfo[gameB].min + gameInfo[gameC].min;
				const maxPossiblePlayers = gameInfo[gameA].max + gameInfo[gameB].max + gameInfo[gameC].min;

				if (!inRange(userGroupVotesWithWeights.length, { min: minPossiblePlayers, max: maxPossiblePlayers })) continue;

				const playerVotesForGames: PlayerScores[] = userGroupVotesWithWeights.map(player => ({
					player,
					scoreForA: player.votesWithWeights[gameA] ?? 0,
					scoreForB: player.votesWithWeights[gameB] ?? 0,
					scoreForC: player.votesWithWeights[gameC] ?? 0,
				}));

				const res = findBestPlayerDistribution(playerVotesForGames, {
					gameA: gameInfo[gameA],
					gameB: gameInfo[gameB],
					gameC: gameInfo[gameC],
				});

				if (res.maxScore > bestRunningResult.score + MIN_DIFFERENCE) {
					bestRunningResult.score = res.maxScore;
					const tmp = Object.groupBy(userGroupVotesWithWeights, (_, index) => res.assignment[index]);
					bestRunningResult.result = {
						[gameA]: {
							scoreForGame: scoreGame(gameA, tmp["A"]!),
							players: tmp["A"]!,
						},
						[gameB]: {
							scoreForGame: scoreGame(gameB, tmp["B"]!),
							players: tmp["B"]!,
						},
						[gameC]: {
							scoreForGame: scoreGame(gameC, tmp["C"]!),
							players: tmp["C"]!,
						},
					};
				}
			}
		}
	}

	if (bestRunningResult.result) {
		return bestRunningResult;
	}
};
