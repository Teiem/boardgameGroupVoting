import { cross, findDistribution, optimizePair, optimizeTriple, type GameId, type UserGroupVotes } from "./score";

export type GameInfo = {
  min: number;
  max: number;
}
export type Games = Record<GameId, GameInfo>;

export const applyOptimizations = (playerVotes: UserGroupVotes[], games: Games) => {
  const dist = findDistribution(playerVotes, games);
  if (!dist.length) return null;

  const bestDist = dist[0];
  pairOptimization:
  while (true) {
    const gamePairs = cross(Object.entries(bestDist.result));

    // find all pairs of groups of players and try to find any optimizing swaps/ game changes
    for (const [[gameAId, gameAGroup], [gameBId, gameBGroup]] of gamePairs) {
      const score = gameAGroup.scoreForGame + gameBGroup.scoreForGame;
      const availableGames = [...(Object.keys(games) as (keyof typeof games)[]).filter(g => !bestDist.result[g]), gameAId, gameBId];

      const result = optimizePair([...gameAGroup.players, ...gameBGroup.players], score, availableGames, games);
      if (result) {
        bestDist.score -= gameAGroup.scoreForGame;
        bestDist.score -= gameBGroup.scoreForGame;
        delete bestDist.result[gameAId];
        delete bestDist.result[gameBId];
        for (const [newGameId, gameData] of Object.entries(result.result)) {
          bestDist.result[newGameId] = gameData;
          bestDist.score += gameData.scoreForGame;
        }
        continue pairOptimization;
      }
    }

    // split single game into two
    for (const [gameId, gameGroup] of Object.entries(bestDist.result)) {
      const availableGames = [...(Object.keys(games) as (keyof typeof games)[]).filter(g => !bestDist.result[g]), gameId];
      const result = optimizePair(gameGroup.players, gameGroup.scoreForGame, availableGames, games);

      if (result) {
        bestDist.score -= gameGroup.scoreForGame;
        delete bestDist.result[gameId];
        for (const [newGameId, gameData] of Object.entries(result.result)) {
          bestDist.result[newGameId] = gameData;
          bestDist.score += gameData.scoreForGame;
        }
        continue pairOptimization;
      }
    }


    tripleOptimization:
    while (true) {
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

  return bestDist;
};