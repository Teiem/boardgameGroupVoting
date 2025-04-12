<script lang="ts">
	import { applyOptimizations } from "$lib/compute/applyOptimizations";
	import * as Card from "$lib/components/ui/card/index.js";
	import { refreshAvailableGames, type AvailableGame } from "$lib/state/state.svelte";
	import { Button } from "../button";
	import { getUserVotes } from "../../../../routes/server.telefunc";
	import { toast } from "svelte-sonner";

	let { availableGames }: { availableGames: AvailableGame[] } = $props();

	let playerAssignments = $state<ReturnType<typeof applyOptimizations> | null | undefined>(undefined);

  let userIdToName: Record<string, string> = {};

  const computeResult = async () => {
    await refreshAvailableGames();

    const toastId = toast.loading("Getting Votes...");

    const userVotes = await getUserVotes();

    toast.loading("Computing Result...", {
      id: toastId,
    });

    userIdToName = Object.fromEntries(
      Object.entries(userVotes).map(([userId, votes]) => [
        userId,
        votes.name,
      ]),
    );

    const formattedVotes = Object.entries(userVotes).map(([userId, votes]) => ({
      memberCount: 1,
      votes: votes.votes,
      groupId: userId,
    }));

    const formattedGames = Object.fromEntries(
      availableGames.map(({ id, game }) => [
        id,
        {
          min: game.minPlayers,
          max: game.maxPlayers,
        },
      ]),
    );

    console.log({
      userVotes,
      formattedVotes,
      formattedGames
    });

    playerAssignments = applyOptimizations(formattedVotes, formattedGames);
    console.log(playerAssignments);

    toast.success("Result Computed", {
      id: toastId,
    });
  };
</script>

<div class="flex flex-col gap-4">
	{#if playerAssignments}
		{@const { score, result } = playerAssignments}
		<span>Score: {score.toFixed(2)}</span>
		{#each Object.entries(result).toSorted((a, b) => a[0].localeCompare(b[0])) as [gameId, _result]}
			{@const { game } = availableGames.find(availableGame => availableGame.id === gameId) as AvailableGame}

			<Card.Root class="m-4 p-4">
				<Card.Header>
					<Card.Title>
						<span>{availableGames.find(game => game.id === gameId)!.game.name}</span>
						<Card.Description>
							<span>{game.minPlayers} - {game.maxPlayers} Players ({_result.players.length})</span>
							<br />
							<span>Total Score: {_result.scoreForGame.toFixed(2)}</span>
						</Card.Description>
					</Card.Title>
				</Card.Header>

				<ul class="mt-2">
					{#each _result.players
						.toSorted((a, b) => a.groupId.localeCompare(b.groupId))
						.toSorted((a, b) => a.votes.length - b.votes.length)
						.toSorted((a, b) => a.votes.indexOf(gameId) - b.votes.indexOf(gameId)) as player}
						<li class="ml-6 list-decimal">
							<span>{userIdToName[player.groupId]} - </span>
							<span>{player.votes.includes(gameId) ? player.votes.indexOf(gameId) + 1 : "☹"} / {player.votes.length} - </span>
							<span
								title={Object.entries(player.votesWithWeights)
									.map(([key, value]) => `${key}: ${value.toFixed(2)}`)
									.join("\n")}>{player.votesWithWeights[gameId]?.toFixed(2) ?? 0}</span
							>
						</li>
					{/each}
				</ul>
			</Card.Root>
		{/each}
	{:else if playerAssignments === undefined}
		<h2>No Results yet</h2>
		{:else if playerAssignments === null}
		<h2>No possible result found</h2>
	{/if}

	<div class="flex gap-2">
		<Button onclick={computeResult}>Compute Result</Button>
		<Button>Share Result</Button>
	</div>
</div>


<style>
</style>
