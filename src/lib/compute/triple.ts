import type { UserGroupVotesWithWeights } from "./score";

export interface PlayerScores {
	player: UserGroupVotesWithWeights;
	scoreForA: number;
	scoreForB: number;
	scoreForC: number;
}

const NEG_INF = Number.NEGATIVE_INFINITY;

export const findBestPlayerDistribution = (
	players: PlayerScores[],
	{
		gameA: { min: A_MIN, max: A_MAX },
		gameB: { min: B_MIN, max: B_MAX },
		gameC: { min: C_MIN, max: C_MAX },
	}: Record<"gameA" | "gameB" | "gameC", { min: number; max: number }>,
) => {
	const playerCount = players.length;

	// Create a 4D DP array:
	// Dimensions: i in [0..n], a in [0..A_MAX], b in [0..B_MAX], c in [0..C_MAX]
	// Initialize all to NEG_INF except dp[0][0][0][0] = 0
	const history: {
		score: number;
		choice: "A" | "B" | "C" | null;
	}[][][][] = [];

	for (let i = 0; i <= playerCount; i++) {
		history[i] = [];
		for (let a = 0; a <= A_MAX; a++) {
			history[i][a] = [];
			for (let b = 0; b <= B_MAX; b++) {
				history[i][a][b] = [];
				for (let c = 0; c <= C_MAX; c++) {
					history[i][a][b][c] = {
						score: NEG_INF,
						choice: null,
					};
				}
			}
		}
	}

	// Base case
	history[0][0][0][0] = {
		score: 0,
		choice: null,
	};

	for (let playerIndex = 1; playerIndex <= playerCount; playerIndex++) {
		const { scoreForA, scoreForB, scoreForC } = players[playerIndex - 1];

		const aMaxBasedOnRound = Math.min(playerIndex, A_MAX);
		const bMaxBasedOnRound = Math.min(playerIndex, B_MAX);
		const cMaxBasedOnRound = Math.min(playerIndex, C_MAX);

		for (let a = 0; a <= aMaxBasedOnRound; a++) {
			for (let b = 0; b <= bMaxBasedOnRound; b++) {
				for (let c = 0; c <= cMaxBasedOnRound; c++) {
					const { score: currentScore } = history[playerIndex - 1][a][b][c];
					if (currentScore === NEG_INF) {
						continue; // invalid state, skip
					}
					// Option 1: assign player i to Game A (if a < A_MAX)
					if (a < A_MAX) {
						const newScore = currentScore + scoreForA;
						const entry = history[playerIndex][a + 1][b][c];
						if (newScore > entry.score) {
							entry.score = newScore;
							entry.choice = "A";
						}
					}
					// Option 2: assign player i to Game B (if b < B_MAX)
					if (b < B_MAX) {
						const newScore = currentScore + scoreForB;
						const entry = history[playerIndex][a][b + 1][c];
						if (newScore > entry.score) {
							entry.score = newScore;
							entry.choice = "B";
						}
					}
					// Option 3: assign player i to Game C (if c < C_EXACT)
					if (c < C_MAX) {
						const newScore = currentScore + scoreForC;
						const entry = history[playerIndex][a][b][c + 1];
						if (newScore > entry.score) {
							entry.score = newScore;
							entry.choice = "C";
						}
					}
				}
			}
		}
	}

	// Now find the best score among valid end states:
	let bestScore = NEG_INF;
	let bestA = -1,
		bestB = -1,
		bestC = -1;
	for (let a = A_MIN; a <= A_MAX; a++) {
		for (let b = B_MIN; b <= B_MAX; b++) {
			for (let c = C_MIN; c <= C_MAX; c++) {
				const score = history[playerCount][a][b][c].score;
				if (score > bestScore) {
					bestScore = score;
					bestA = a;
					bestB = b;
					bestC = c;
				}
			}
		}
	}

	if (bestScore === NEG_INF) {
		// No valid assignment found
		return {
			maxScore: 0,
			assignment: [],
		};
	}

	const remainingPlayers = {
		A: bestA,
		B: bestB,
		C: bestC,
	};

	const assignment: ("A" | "B" | "C")[] = Array(playerCount);
	for (let i = playerCount; i > 0; i--) {
		const { choice } = history[i][remainingPlayers.A][remainingPlayers.B][remainingPlayers.C];
		if (!choice) throw new Error("Invalid path");

		assignment.push(choice);
		remainingPlayers[choice] -= 1;
	}

	assignment.reverse();

	// Return final result
	return {
		maxScore: bestScore,
		assignment,
	};
};
