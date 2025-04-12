<script lang="ts">
	import * as Accordion from "$lib/components/ui/accordion/index.js";
	import AddGame from "$lib/components/ui/addGame/addGame.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import DndList from "$lib/components/ui/dndList/dndList.svelte";
	import GameCard from "$lib/components/ui/game/game.svelte";
	import Input from "$lib/components/ui/input/input.svelte";
	import { setInstance, setUser, user, refreshAvailableGames, availableGames } from "$lib/state/state.svelte.js";
	import type { AvailableUser, Game } from "@prisma/client";
	import { ArrowDown, ArrowUp, Plus, RefreshCcw } from "lucide-svelte";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { DBSetVotes } from "./server.telefunc.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import Results from "$lib/components/ui/results/results.svelte";
	import AddExistingGame from "$lib/components/ui/addExistingGame/addExistingGame.svelte";

	let { data } = $props();

	setInstance({ name: data.instanceId });
	setUser(data.user);

	availableGames.splice(0, 0, ...data.availableGames);
	let votes = $state(data.votes);

	let lastGames = $state(data.lastGames);

	// let wantsToPlayWith = $state<AvailableUser["id"] | null>(null);

	const onUsernameChange = () => {
		fetch(`/api/user/${data.user.id}`, {
			method: "PATCH",
			body: JSON.stringify({
				name: user.name,
			}),
		});
	};
	const selectedGames = $derived.by(() => votes.map(vote => availableGames.find(availableGame => availableGame.id === vote)).filter(x => !!x));
	const notSelectedGames = $derived.by(() => availableGames.filter(availableGame => !votes.includes(availableGame.id)));

	const SORTS = {
		Name: {
			cmp: (a: { game: Game }, b: { game: Game }) => a.game.name.localeCompare(b.game.name),
			defaultDirection: "asc",
		},
		Rating: {
			cmp: (a: { game: Game }, b: { game: Game }) => (a.game.rating ?? 0) - (b.game.rating ?? 0),
			defaultDirection: "desc",
		},
		Complexity: {
			cmp: (a: { game: Game }, b: { game: Game }) => (a.game.complexity ?? 0) - (b.game.complexity ?? 0),
			defaultDirection: "desc",
		},
	} as const;

	let sorting = $state<{ key: null | keyof typeof SORTS; direction: "asc" | "desc" }>({
		key: null,
		direction: "asc",
	});

	const sorted = $derived.by(() => {
		if (!sorting.key) return notSelectedGames;

		const _sorted = notSelectedGames.toSorted(SORTS[sorting.key].cmp);

		if (sorting.direction === "desc") _sorted.reverse();

		return _sorted;
	});

	const sortedAndPromotedFirst = $derived(
		sorted.toSorted((a, b) => {
			if (a.isPromoted === b.isPromoted) return 0;
			if (a.isPromoted) return -1;
			return 1;
		}),
	);

	let maxDuration = $state<number | null>(null);

	const filteredAndSorted = $derived.by(() => {
		if (!maxDuration) return sortedAndPromotedFirst;

		return sortedAndPromotedFirst.filter(availableGame => availableGame.game.maxDuration <= maxDuration!);
	});

	const hasPromotedGame = $derived(availableGames.some(availableGame => availableGame.isPromoted && availableGame.ownerId === user.id));
</script>

<div class="p-4">
	<h1>{data.instanceId}</h1>

	<label>
		<span>Name:</span>
		<Input type="text" bind:value={user.name} onchange={onUsernameChange} title="My Name" minlength={3} />
	</label>

	<!-- <label>
		<span>I would like to join </span>
		<select bind:value={wantsToPlayWith}>
			<option value={null}>no one</option>
			{#each data.availableUsers as availableUser (availableUser.id)}
				<option value={availableUser.id}>{availableUser.name}</option>
			{/each}
		</select>
		<span>and play whatever they play</span>
	</label> -->

	<Separator class="my-6" />

	<Tabs.Root value="voting">
		<Tabs.List>
			<Tabs.Trigger value="voting">Voting</Tabs.Trigger>
			<Tabs.Trigger value="results">Results</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="voting">
			<div>
				<h2 class="mb-4 text-xl font-bold">Selected Games</h2>
				<Accordion.Root type="single" class="mb-4 flex flex-col gap-2">
					<DndList
						items={selectedGames}
						onSwap={items => {
							// console.log("SWAP", items.map(item => selectedGames.find(selectedGame => selectedGame.id === item)?.game.name));
							votes = items;
							DBSetVotes(user.id, votes);
						}}
					>
						{#snippet snippet({ item, ...rest })}
							<GameCard
								bind:game={item.game}
								availableGame={item}
								{...rest}
								onSuccess={() => {
									// TODO stopped working
									votes.splice(votes.indexOf(item.id), 1);
									DBSetVotes(user.id, votes);
								}}
							></GameCard>
						{/snippet}
					</DndList>
				</Accordion.Root>
			</div>

			<Separator class="my-6" />

			<div>
				<h2 class="mb-4 flex items-center justify-between text-xl font-bold">
					<span>All Games</span>
					<Button size="icon" onclick={refreshAvailableGames}><RefreshCcw /></Button>
				</h2>
				<div class="mb-4 flex flex-wrap gap-2">
					<Label>Sort by:</Label>
					<div class="mb-4 flex flex-wrap gap-2">
						<div class="buttons grid grow grid-cols-[1fr,1fr,1fr] items-center gap-2">
							<!-- <Button variant="outline" class="flex items-center gap-2">Sort by Name</Button> -->
							<!-- <Button variant="outline" class="flex items-center gap-2">Sort by Rating</Button> -->
							<!-- <Button variant="outline" class="flex items-center gap-2">Sort by Complexity</Button> -->
							{#each Object.keys(SORTS) as (keyof typeof SORTS)[] as key (key)}
								<Button
									variant={sorting.key === key ? "default" : "outline"}
									class="flex items-center gap-2"
									onclick={() => {
										if (sorting.key === key) {
											sorting.direction = sorting.direction === "asc" ? "desc" : "asc";
										} else {
											sorting.key = key;
											sorting.direction = SORTS[key].defaultDirection;
										}
									}}
								>
									<span>{key}</span>
									{#if sorting.key === key}
										{#if sorting.direction === "asc"}
											<ArrowUp class="h-4 w-4" />
										{:else if sorting.direction === "desc"}
											<ArrowDown class="h-4 w-4" />
										{/if}
									{/if}
								</Button>
							{/each}
						</div>
						<Input bind:value={maxDuration} type="number" placeholder="Max duration (min)" min={0} max={300} step={30} class="field-sizing-content" />
					</div>
				</div>
				<Accordion.Root type="single" class="mb-4 flex flex-col gap-2">
					<!-- <DndList items={filteredAndSorted} enabled={false}>
						{#snippet snippet({ item, ...rest })}
							<GameCard
								bind:game={item.game}
								availableGame={item}
								{...rest}
								onSuccess={() => {
									votes.push(item.id);
									DBSetVotes(user.id, votes);
								}}
							></GameCard>
						{/snippet}
					</DndList> -->
					AAAA
					{#each filteredAndSorted as item}
						<GameCard
							bind:game={item.game}
							availableGame={item}
							onSuccess={() => {
								votes.push(item.id);
								DBSetVotes(user.id, votes);
							}}
							disable={() => {}}
							enable={() => {}}
							isDragging={false}
						></GameCard>
					{/each}
				</Accordion.Root>
				BBB
			</div>

			<Separator class="my-6" />

			<AddGame existingGames={data.games} {hasPromotedGame}></AddGame>
			{#if lastGames.length > 0}
				<AddExistingGame bind:lastGames={lastGames}/>
			{/if}
		</Tabs.Content>
		<Tabs.Content value="results">
			<Results {availableGames} />
		</Tabs.Content>
	</Tabs.Root>
</div>

<style>
	:global(.dialog-content) {
		--spacing: 1rem;
		width: calc(100vw - var(--spacing) * 2);
		height: calc(100vh - var(--spacing) * 2);
		border-radius: 1rem;
		overflow-x: scroll;

		box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
		border: 1px solid transparent;
		border-color: hsl(var(--border));
		box-sizing: border-box;
	}
</style>
