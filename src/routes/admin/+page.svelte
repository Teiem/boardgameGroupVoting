<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { onMount } from "svelte";
	import { DBDeleteAvailableGame, DBDeleteUser, DBGetUserNameFromId, DBSetVotes, DBSoftDeleteAvailableGame, getUserVotes } from "../server.telefunc";
	import { availableGames, refreshAvailableGames } from "$lib/state/state.svelte";

	let userVotes: Record<string, { name: string; votes: string[] }> = $state({});

	const getData = async () => {
		await refreshAvailableGames();
		userVotes = await getUserVotes();
	};

	const gamesByPerson = $derived(Object.groupBy(availableGames, game => game.ownerId));

	onMount(() => {
		getData();
	});

	const people = $derived.by(async () => {
		const set = new Set([...Object.keys(gamesByPerson), ...Object.keys(userVotes)]);
		const uniqueArray = Array.from(set);
		uniqueArray.map(async userId => {
			if (userVotes[userId]) {
				return {
					id: userId,
					name: userVotes[userId].name,
				};
			} else {
				return {
					id: userId,
					name: DBGetUserNameFromId(userId),
				};
			}
		});

		return Promise.all(
			uniqueArray.map(async userId => {
				if (userVotes[userId]) {
					return {
						id: userId,
						name: userVotes[userId].name,
					};
				} else {
					return {
						id: userId,
						...(await DBGetUserNameFromId(userId)),
					};
				}
			}),
		);
	});

	const removeAllVotes = () => Promise.all(Object.keys(userVotes).map(userId => DBSetVotes(userId, [])));

	const removeAllBroughtGames = async () => {
    await removeAllVotes();
		await Promise.all(availableGames.map(game => DBSoftDeleteAvailableGame(game.id)));

		getData();
	};

  const clearVotes = async (userId: string) => {
    await DBSetVotes(userId, []);
    getData();
  };

  const deleteUser = async (userId: string) => {
    await DBDeleteUser(userId);
    getData();
  };
</script>

<main>
	<h1>Admin Interface</h1>
	{#await people}
		Loading usernames...
	{:then loaded}
		{#each loaded as { name, id }}
			{@const games = gamesByPerson[id] ?? []}
			{@const { votes } = userVotes[id] ?? {}}
			<section>
				<h1>{name}</h1>
				<div>
					<h2>Votes:</h2>
					<ul>
						{#each votes as vote}
							<li>{availableGames.find(game => vote === game.id)!.game.name}</li>
						{/each}
					</ul>
				</div>
				<div>
					<h2>Games:</h2>
					<ul>
						{#each games as game}
							<li>{game.game.name}</li>
						{/each}
					</ul>
				</div>
        <Button onclick={() => clearVotes(id)}>Clear Votes</Button>
        <Button onclick={() => deleteUser(id)}>Delete User</Button>
			</section>
		{/each}
	{/await}
</main>

<Button onclick={getData}>Refresh</Button>
<Button onclick={removeAllBroughtGames}>Remove all brought Games</Button>

<style>
	main {
		padding: 1rem;
	}

	section {
		margin-bottom: 2rem;
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 8px;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	h2 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}
</style>
