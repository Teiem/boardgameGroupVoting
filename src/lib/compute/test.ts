import { applyOptimizations } from "./applyOptimizations";
import { findDistribution, type UserGroupVotes, cross, optimizePair, MAX_ITERATIONS, optimizeTriple } from "./score";

export const games = {
	a: {
		min: 2,
		max: 2,
	},
	b: {
		min: 3,
		max: 4,
	},
	c: {
		min: 4,
		max: 4,
	},
	d: {
		min: 3,
		max: 5,
	},
	X: {
		min: 2,
		max: 4,
	},
	"1": {
		min: 6,
		max: 11,
	},
	"2": {
		min: 4,
		max: 4,
	},
	"3": {
		min: 2,
		max: 2,
	},
};

type Case = {
	name: string;
	data: UserGroupVotes[];
};

const cases: Case[] = [
	// {
	// 	name: "Game filled with best options is not best overall - other group can not find common game",
	// 	data: [
	// 		// a b X X X X c d
	// 		// 1 1 1 1 2 2 2 2
	// 		// expected Solution: games 1, 2
	// 		{
	// 			groupId: "Alice",
	// 			votes: ["a", "1"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Bob",
	// 			votes: ["b", "1"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Charlie",
	// 			votes: ["X", "1"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "David",
	// 			votes: ["X", "1"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Eve",
	// 			votes: ["X", "2"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Frank",
	// 			votes: ["X", "2"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Grace",
	// 			votes: ["c", "2"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Hannah",
	// 			votes: ["d", "2"],
	// 			memberCount: 1,
	// 		},
	// 	],
	// },
	// {
	// 	name: "Game filled with best options is not best overall - other group has no alternative game",
	// 	data: [
	// 		// a b 1 1 1 1 c d
	// 		// 1 1 2 2 2 2 1 1
	// 		{
	// 			groupId: "Alice",
	// 			votes: ["a", "1"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Bob",
	// 			votes: ["b", "1"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Charlie",
	// 			votes: ["1", "2"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "David",
	// 			votes: ["1", "2"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Eve",
	// 			votes: ["1", "2"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Frank",
	// 			votes: ["1", "2"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Grace",
	// 			votes: ["c", "1"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Hannah",
	// 			votes: ["d", "1"],
	// 			memberCount: 1,
	// 		},
	// 	],
	// },
	// {
	// 	name: "Random",
	// 	data: [
	// 		{
	// 			groupId: "Alice",
	// 			votes: ["1", "a", "X", "2", "b", "3"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Bob",
	// 			votes: ["1", "a", "2", "b", "X", "c"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Charlie",
	// 			votes: ["c", "a"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "David",
	// 			votes: ["X", "a"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Eve",
	// 			votes: ["1", "2", "d", "c"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Frank",
	// 			votes: ["3", "2", "1", "b"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Grace",
	// 			votes: ["1", "X", "b", "d"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Hannah",
	// 			votes: ["d", "a", "c", "2", "1", "3", "X", "b"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Ivy",
	// 			votes: ["c", "X", "a", "d", "3", "b", "1"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Jack",
	// 			votes: ["b", "1", "3", "c"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Karl",
	// 			votes: ["X", "c", "a", "2", "b", "d", "3", "1"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Liam",
	// 			votes: ["2", "1", "3"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Mia",
	// 			votes: ["d", "a", "2", "3", "X", "b", "c"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Nora",
	// 			votes: ["X", "c", "2"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Oliver",
	// 			votes: ["a", "d"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Paul",
	// 			votes: ["X", "c", "3", "b"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Quinn",
	// 			votes: ["2", "a", "1"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Rose",
	// 			votes: ["X", "a", "c", "1"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Sam",
	// 			votes: ["2", "a", "c", "3"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Tina",
	// 			votes: ["3", "2", "1", "c", "d", "a"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Urs",
	// 			votes: ["a", "X", "b", "3"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Vera",
	// 			votes: ["3", "c", "1", "a", "2", "d", "X", "b"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Will",
	// 			votes: ["a", "b"],
	// 			memberCount: 1,
	// 		},
	// 		{
	// 			groupId: "Xara",
	// 			votes: ["X"],
	// 			memberCount: 1,
	// 		},
	// 	],
	// },
];

const gameNames = Object.keys(games);
const names = [
	"Alice",
	"Bob",
	"Charlie",
	"David",
	"Eve",
	"Frank",
	"Grace",
	"Hannah",
	"Ivy",
	"Jack",
	"Karl",
	"Liam",
	"Mia",
	"Nora",
	"Oliver",
	"Paul",
	"Quinn",
	"Rose",
	"Sam",
	"Tina",
	"Urs",
	"Vera",
	"Will",
	"Xara",
	"Yara",
	"Zoe",
	"Anna - 1",
	"Berta - 2",
	"Carla - 3",
	"Dora - 4",
	"Emma - 5",
	"Fiona - 6",
	"Gina - 7",
	"Hanna - 8",
	"Ida - 9",
	"Julia - 10",
	"Klara - 11",
	"Lena - 12",
	"Maria - 13",
	"Nina - 14",
	"Oda - 15",
	"Paula - 16",
	"Rita - 17",
	"Sara - 18",
	"Tina - 19",
	"Ulla - 20",
	"Vera - 21",
	"Wilma - 22",
	"Xara - 23",
	"Yara - 24",
	"Zara - 25",
];

export const generateRandomCase = (
	playerCount: {
		min: number;
		max: number;
	},
	gameCount: {
		min: number;
		max: number;
	},
) => {
	const groupCount = Math.floor(Math.random() * (playerCount.max - playerCount.min + 1)) + playerCount.min;
	return Array.from({ length: groupCount }, (_, i) => {
		// distinct votes:
		const votes: string[] = [];
		const voteCount = Math.floor(Math.random() * (gameCount.max - gameCount.min + 1)) + gameCount.min;
		do {
			const vote = gameNames[Math.floor(Math.random() * gameNames.length)];
			if (!votes.includes(vote)) {
				votes.push(vote);
			}
		} while (votes.length < voteCount);
		return {
			groupId: names[i],
			votes,
			memberCount: 1,
		};
	});
};

cases.push({
	name: "Random",
	data: generateRandomCase({ min: 16, max: 32 }, { min: 1, max: 8 }),
});

const overrideBest: ReturnType<typeof findDistribution>[number] = {
	score: 34.91967256532098,
	result: {
		"1": {
			scoreForGame: 16.49144107841928,
			players: [
				{
					groupId: "Liam",
					votes: ["2", "1", "3"],
					memberCount: 1,
					votesWithWeights: {
						"1": 1.3228342099734995,
						"2": 1.6666666666666667,
						"3": 1.1556021239177248,
					},
				},
				{
					groupId: "Rose",
					votes: ["X", "a", "c", "1"],
					memberCount: 1,
					votesWithWeights: {
						"1": 1.237436867076458,
						X: 1.75,
						a: 1.4715687266940005,
						c: 1.329712449890287,
					},
				},
				{
					groupId: "Frank",
					votes: ["3", "2", "1", "b"],
					memberCount: 1,
					votesWithWeights: {
						"1": 1.329712449890287,
						"2": 1.4715687266940005,
						"3": 1.75,
						b: 1.237436867076458,
					},
				},
				{
					groupId: "Ivy",
					votes: ["c", "X", "a", "d", "3", "b", "1"],
					memberCount: 1,
					votesWithWeights: {
						"1": 1.4064264353741702,
						"3": 1.4756808944462971,
						c: 1.8571428571428572,
						X: 1.6820582336329697,
						a: 1.5873954569704256,
						d: 1.5234799468713276,
						b: 1.4377416299231325,
					},
				},
				{
					groupId: "Karl",
					votes: ["X", "c", "a", "2", "b", "d", "3", "1"],
					memberCount: 1,
					votesWithWeights: {
						"1": 1.4458226488199444,
						"2": 1.5766807786007149,
						"3": 1.4701580187922958,
						X: 1.875,
						c: 1.7193825810087586,
						a: 1.6344103928845044,
						b: 1.533310188671142,
						d: 1.4987609385308258,
					},
				},
				{
					groupId: "Jack",
					votes: ["b", "1", "3", "c"],
					memberCount: 1,
					votesWithWeights: {
						"1": 1.4715687266940005,
						"3": 1.329712449890287,
						b: 1.75,
						c: 1.237436867076458,
					},
				},
				{
					groupId: "Tina",
					votes: ["3", "2", "1", "c", "d", "a"],
					memberCount: 1,
					votesWithWeights: {
						"1": 1.5265858257019411,
						"2": 1.6333143165906219,
						"3": 1.8333333333333333,
						c: 1.4551176309708493,
						d: 1.4019949007748382,
						a: 1.3600333552490709,
					},
				},
				{
					groupId: "Hannah",
					votes: ["d", "a", "c", "2", "1", "3", "X", "b"],
					memberCount: 1,
					votesWithWeights: {
						"1": 1.533310188671142,
						"2": 1.5766807786007149,
						"3": 1.4987609385308258,
						d: 1.875,
						a: 1.7193825810087586,
						c: 1.6344103928845044,
						X: 1.4701580187922958,
						b: 1.4458226488199444,
					},
				},
				{
					groupId: "Vera",
					votes: ["3", "c", "1", "a", "2", "d", "X", "b"],
					memberCount: 1,
					votesWithWeights: {
						"1": 1.6344103928845044,
						"2": 1.533310188671142,
						"3": 1.875,
						c: 1.7193825810087586,
						a: 1.5766807786007149,
						d: 1.4987609385308258,
						X: 1.4701580187922958,
						b: 1.4458226488199444,
					},
				},
				{
					groupId: "Grace",
					votes: ["1", "X", "b", "d"],
					memberCount: 1,
					votesWithWeights: {
						"1": 1.75,
						X: 1.4715687266940005,
						b: 1.329712449890287,
						d: 1.237436867076458,
					},
				},
				{
					groupId: "Bob",
					votes: ["1", "a", "2", "b", "X", "c"],
					memberCount: 1,
					votesWithWeights: {
						"1": 1.8333333333333333,
						"2": 1.5265858257019411,
						a: 1.6333143165906219,
						b: 1.4551176309708493,
						X: 1.4019949007748382,
						c: 1.3600333552490709,
					},
				},
			],
		},
		"2": {
			scoreForGame: 5.748955148249241,
			players: [
				{
					groupId: "Quinn",
					votes: ["2", "a", "1"],
					memberCount: 1,
					votesWithWeights: {
						"1": 1.1556021239177248,
						"2": 1.6666666666666667,
						a: 1.3228342099734995,
					},
				},
				{
					groupId: "Nora",
					votes: ["X", "c", "2"],
					memberCount: 1,
					votesWithWeights: {
						"2": 1.1556021239177248,
						X: 1.6666666666666667,
						c: 1.3228342099734995,
					},
				},
				{
					groupId: "Alice",
					votes: ["1", "a", "X", "2", "b", "3"],
					memberCount: 1,
					votesWithWeights: {
						"1": 1.8333333333333333,
						"2": 1.4551176309708493,
						"3": 1.3600333552490709,
						a: 1.6333143165906219,
						X: 1.5265858257019411,
						b: 1.4019949007748382,
					},
				},
				{
					groupId: "Eve",
					votes: ["1", "2", "d", "c"],
					memberCount: 1,
					votesWithWeights: {
						"1": 1.75,
						"2": 1.4715687266940005,
						d: 1.329712449890287,
						c: 1.237436867076458,
					},
				},
			],
		},
		c: {
			scoreForGame: 5.707707611958458,
			players: [
				{
					groupId: "Sam",
					votes: ["2", "a", "c", "3"],
					memberCount: 1,
					votesWithWeights: {
						"2": 1.75,
						"3": 1.237436867076458,
						a: 1.4715687266940005,
						c: 1.329712449890287,
					},
				},
				{
					groupId: "Mia",
					votes: ["d", "a", "2", "3", "X", "b", "c"],
					memberCount: 1,
					votesWithWeights: {
						"2": 1.5873954569704256,
						"3": 1.5234799468713276,
						d: 1.8571428571428572,
						a: 1.6820582336329697,
						X: 1.4756808944462971,
						b: 1.4377416299231325,
						c: 1.4064264353741702,
					},
				},
				{
					groupId: "Paul",
					votes: ["X", "c", "3", "b"],
					memberCount: 1,
					votesWithWeights: {
						"3": 1.329712449890287,
						X: 1.75,
						c: 1.4715687266940005,
						b: 1.237436867076458,
					},
				},
				{
					groupId: "Charlie",
					votes: ["c", "a"],
					memberCount: 1,
					votesWithWeights: {
						c: 1.5,
						a: 1.0606601717798212,
					},
				},
			],
		},
		X: {
			scoreForGame: 3.9715687266940005,
			players: [
				{
					groupId: "Xara",
					votes: ["X"],
					memberCount: 1,
					votesWithWeights: {
						X: 1,
					},
				},
				{
					groupId: "Urs",
					votes: ["a", "X", "b", "3"],
					memberCount: 1,
					votesWithWeights: {
						"3": 1.237436867076458,
						a: 1.75,
						X: 1.4715687266940005,
						b: 1.329712449890287,
					},
				},
				{
					groupId: "David",
					votes: ["X", "a"],
					memberCount: 1,
					votesWithWeights: {
						X: 1.5,
						a: 1.0606601717798212,
					},
				},
			],
		},
		a: {
			scoreForGame: 3,
			players: [
				{
					groupId: "Oliver",
					votes: ["a", "d"],
					memberCount: 1,
					votesWithWeights: {
						a: 1.5,
						d: 1.0606601717798212,
					},
				},
				{
					groupId: "Will",
					votes: ["a", "b"],
					memberCount: 1,
					votesWithWeights: {
						a: 1.5,
						b: 1.0606601717798212,
					},
				},
			],
		},
	},
};

const test = (playerVotes: UserGroupVotes[]) => {
	const start = performance.now();
	const dist = findDistribution(playerVotes, games);
	// const dist = [overrideBest];
	console.log(`found ${dist.length} / ${MAX_ITERATIONS} distributions`);
	const averageScore = dist.reduce((acc, d) => acc + d.score, 0) / dist.length;
	console.log("averageScore", averageScore);
	if (!dist.length) return null;

	const bestDist = dist[0];
	console.log("BEST DIST", structuredClone(bestDist));

	console.log("PAIRS", Object.entries(bestDist.result).length, cross(Object.entries(bestDist.result)).length);
	let i = 0;
	dance: while (true) {
		// console.log("ITERATION", i++);
		// todo normal for loop
		const gamePairs = cross(Object.entries(bestDist.result));

		for (const [[gameAId, gameAGroup], [gameBId, gameBGroup]] of gamePairs) {
			const score = gameAGroup.scoreForGame + gameBGroup.scoreForGame;
			const availableGames = [...(Object.keys(games) as (keyof typeof games)[]).filter(g => !bestDist.result[g]), gameAId, gameBId];

			const result = optimizePair([...gameAGroup.players, ...gameBGroup.players], score, availableGames, games);
			if (result) {
				const scoreBefore = bestDist.score;
				// console.log("Before", gameAGroup.scoreForGame.toFixed(2), "+", gameBGroup.scoreForGame.toFixed(2), "=", score.toFixed(2));
				// console.log("After", result.result[gameAId].scoreForGame.toFixed(2), "+", result.result[gameBId].scoreForGame.toFixed(2), "=", result.score.toFixed(2));
				// console.log("result.result", result.result);

				const numberOfPlayersBefore = Object.values(bestDist.result).reduce((acc, g) => acc + g.players.length, 0);

				const bestDistBefore = structuredClone(bestDist);

				bestDist.score -= gameAGroup.scoreForGame;
				bestDist.score -= gameBGroup.scoreForGame;
				delete bestDist.result[gameAId];
				delete bestDist.result[gameBId];
				for (const [newGameId, gameData] of Object.entries(result.result)) {
					bestDist.result[newGameId] = gameData;
					bestDist.score += gameData.scoreForGame;
				}

				const numberOfPlayersAfter = Object.values(bestDist.result).reduce((acc, g) => acc + g.players.length, 0);
				if (numberOfPlayersBefore !== numberOfPlayersAfter) {
					// console.log("result", {
					// 	numberOfPlayersBefore,
					// 	numberOfPlayersAfter,
					// 	bestDistBefore,
					// 	bestDist,
					// 	result,
					// });
					throw new Error("Number of players changed - 1");
				}
				const scoreAfter = bestDist.score;
				// console.log("------------ IMPROVEMENT", scoreBefore, scoreAfter);
				continue dance;
			} else {
				// console.log("NO IMPROVEMENT");
			}
		}

		for (const [gameId, gameGroup] of Object.entries(bestDist.result)) {
			const availableGames = [...(Object.keys(games) as (keyof typeof games)[]).filter(g => !bestDist.result[g]), gameId];
			const result = optimizePair(gameGroup.players, gameGroup.scoreForGame, availableGames, games);

			if (result) {
				const scoreBefore = bestDist.score;
				// console.log("Before", gameGroup.scoreForGame.toFixed(2), "=", scoreBefore.toFixed(2));
				// console.log("After", result.result[gameId].scoreForGame.toFixed(2), "=", result.score.toFixed(2));
				// console.log("result.result", result.result);

				const bestDistBefore = structuredClone(bestDist);
				const numberOfPlayersBefore = Object.values(bestDist.result).reduce((acc, g) => acc + g.players.length, 0);

				bestDist.score -= gameGroup.scoreForGame;
				delete bestDist.result[gameId];
				for (const [newGameId, gameData] of Object.entries(result.result)) {
					bestDist.result[newGameId] = gameData;
					bestDist.score += gameData.scoreForGame;
				}

				const numberOfPlayersAfter = Object.values(bestDist.result).reduce((acc, g) => acc + g.players.length, 0);
				if (numberOfPlayersBefore !== numberOfPlayersAfter) {
					// console.log("result", {
					// 	numberOfPlayersBefore,
					// 	numberOfPlayersAfter,
					// 	bestDistBefore,
					// 	bestDist,
					// 	result,
					// 	gameId,
					// });
					throw new Error("Number of players changed - 2");
				}

				const scoreAfter = bestDist.score;
				// console.log("------------ IMPROVEMENT - 2", scoreBefore, scoreAfter);
				continue dance;
			}
		}


		tripleOptimization:
		while (true) {
			console.log("Looking for triple improvement");
			const entries = Object.entries(bestDist.result);
			for (let i1 = 0; i1 < entries.length; i1++) {
				const [gameAId, gameAGroup] = entries[i1];
				for (let i2 = i1 + 1; i2 < entries.length; i2++) {
					const [gameBId, gameBGroup] = entries[i2];
					for (let i3 = i2 + 1; i3 < entries.length; i3++) {
						const [gameCId, gameCGroup] = entries[i3];
						const score = gameAGroup.scoreForGame + gameBGroup.scoreForGame + gameCGroup.scoreForGame;
						const availableGames = [...(Object.keys(games) as (keyof typeof games)[]).filter(g => !bestDist.result[g]), gameAId, gameBId, gameCId];

						const result = optimizeTriple([...gameAGroup.players, ...gameBGroup.players, ...gameCGroup.players], score, availableGames, games);

						if (result) {
							const scoreImprovement = result.score - score;
							console.log("TRIPLE IMPROVEMENT", `score: ${score} -> ${result.score}, +${scoreImprovement}`, result);

							bestDist.score += scoreImprovement;
							delete bestDist.result[gameAId];
							delete bestDist.result[gameBId];
							delete bestDist.result[gameCId];

							for (const [newGameId, gameData] of Object.entries(result.result)) {
								bestDist.result[newGameId] = gameData;
							}

							continue tripleOptimization;
						}
					}
				}
			}

			break;
		}

		break;
	}

	const end = performance.now();
	console.log("TIME", end - start);
	// console.log("DIST", dist);

	return {
		bestDist,
		dist,
		time: end - start,
	};
};

export const init = () => {
	console.clear();
	console.log("INIT", cases[0]);
	const results = cases.map(c => ({
		...c,
		result: applyOptimizations(c.data, games),
	}));
	console.log("results", results);
	console.log("RESULTS", results[0].result);
	return results;
};
