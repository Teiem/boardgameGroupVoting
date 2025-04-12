import type { Instance, AvailableUser, Prisma, AvailableGame as _AvailableGame, Game } from "@prisma/client";
import { toast } from "svelte-sonner";
import { DBAddAvailableGame, DBDeleteAvailableGame, DBGetAvailableGames, DBRestoreAvailableGame, DBUpdateAvailableGameAndGame } from "../../routes/server.telefunc";

export const instance: Pick<Instance, "name"> = $state({} as never);
export const setInstance = (_instance: Pick<Instance, "name">) => Object.assign(instance, _instance);

export const user: AvailableUser = $state({} as never);
export const setUser = (_user: AvailableUser) => Object.assign(user, _user);

export type AvailableGame = _AvailableGame & {
  game: Game;
};
export const availableGames: AvailableGame[] = $state([]);

export const addAvailableGame = async (availableGame: Prisma.AvailableGameUncheckedCreateInput, game: Prisma.GameUncheckedCreateInput) => {
  const toastId = toast.loading(`Adding ${game.name}...`);

	const addedAvailableGame = await DBAddAvailableGame(availableGame, game);
  availableGames.push(addedAvailableGame);

  toast.success(`Added ${game.name}`, {
    id: toastId,
  });
};

export const removeAvailableGame = async (availableGameId: AvailableGame["id"], gameName: string = "Game") => {
  const toastId = toast.loading(`Removing ${gameName}...`);

  await DBDeleteAvailableGame(availableGameId);
	availableGames.splice(0, availableGames.length, ...availableGames.filter(game => game.id !== availableGameId));

  toast.success(`Removed ${gameName}`, {
    id: toastId,
  });
};

export const updateAvailableGame = async (availableGame: Prisma.AvailableGameUncheckedUpdateInput & Pick<Prisma.AvailableGameUncheckedCreateInput, "id">, game: Prisma.GameUncheckedUpdateInput & Pick<Prisma.GameUncheckedCreateInput, "id">) => {
  const toastId = toast.loading(`Updating ${game.name}...`);

  const updatedAvailableGame = await DBUpdateAvailableGameAndGame(availableGame, game);
  const index = availableGames.findIndex(existingGame => existingGame.id === updatedAvailableGame.id);
  if (index !== -1) {
    availableGames[index] = updatedAvailableGame;
  } else {
    // Should not happen?
    availableGames.push(updatedAvailableGame);
  }

  toast.success(`Updated ${game.name}`, {
    id: toastId,
  });
};

export const refreshAvailableGames = async () => {
  const toastId = toast.loading("Updating available games...");

  const _availableGames = await DBGetAvailableGames();

  availableGames.splice(0, availableGames.length, ..._availableGames.map(availableGame => {
    const existingGame = availableGames.find(existingGame => existingGame.id === availableGame.id);

    if (existingGame) {
      return Object.assign(existingGame, availableGame);
    }

    return availableGame;
  }));

  toast.success("Updated available games", {
    id: toastId,
  });
};

export const reactivateAvailableGame = async (availableGame: AvailableGame) => {
  availableGame.isDeleted = false;

  await DBRestoreAvailableGame(availableGame.id);
  availableGames.push(availableGame);
};