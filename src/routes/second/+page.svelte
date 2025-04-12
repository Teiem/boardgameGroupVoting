<script lang="ts">
	import { init, games } from "$lib/compute/test";
	import { onMount } from "svelte";
	import * as Card from "$lib/components/ui/card/index.js";

	let data: ReturnType<typeof init> | undefined;

	onMount(() => {
		data = init();
	});
</script>

{#if data}
	{#each data as { result: testResult, name }, i (i)}
		{#if testResult}
			{@const { score, result } = testResult}
			<h1>Test: {name}</h1>
			<span>Score: {score.toFixed(2)}</span>
			{#each Object.entries(result).toSorted((a,b) => a[0].localeCompare(b[0])) as [gameId, _result]}
				<Card.Root class="m-4 p-4">
					<Card.Header >
						<Card.Title>
							<span>{gameId}</span>
							<Card.Description>
                <span>{games[gameId as keyof typeof games].min} - {games[gameId as keyof typeof games].max} Players ({_result.players.length})</span>
                <br>
                <span>Total Score: {_result.scoreForGame.toFixed(2)}</span>
              </Card.Description>
						</Card.Title>
					</Card.Header>

					<ul class="mt-2">
						{#each _result.players.toSorted((a, b) => a.groupId.localeCompare(b.groupId)).toSorted((a, b) => a.votes.length - b.votes.length).toSorted((a, b) => a.votes.indexOf(gameId) - b.votes.indexOf(gameId) ) as player}
							<li class="list-decimal ml-6">
								<span>{player.groupId} - </span>
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
		{:else}
			<span>Could not compute</span>
		{/if}
	{/each}
{/if}
