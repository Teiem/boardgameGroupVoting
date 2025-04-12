<script lang="ts">
	import type { Game, Prisma } from "@prisma/client";
	import Combobox from "../combobox/combobox.svelte";
	import type { BGGSearchResponse, BoardGameItem } from "../../../../routes/api/bgg/+server";
	import { bgg } from "bgg-sdk";
	import { instance } from "$lib/state/state.svelte";

	type Option = {
		value: string;
		label: string;
		game?: Game;
	};

	type Props = {
		existingGames: Game[];
		// selectedGame: (Prisma.GameUncheckedCreateInput & { isNew?: true }) | null;
		selectedGame: Prisma.GameUncheckedCreateInput | null;
	};

	let { existingGames, selectedGame = $bindable(null) }: Props = $props();

	const existingIds = new Set(existingGames.map(game => game.id));

	const _existingGames: Option[] = existingGames.map(game => ({
		value: game.id,
		label: `${game.name} (existing)`,
		game,
	}));

	let query = $state("");
	let bggSuggestions: Option[] = $state([]);
	let existingGamesFiltered = $derived(
		_existingGames.filter(game => game.label.toLowerCase().includes(query.toLowerCase())),
	);
	let allAutoSuggestions: Option[] = $derived([...existingGamesFiltered, ...bggSuggestions]);

	let selectedOption: Option | null = $state(null);

	$effect(() => {
		if (query !== "") {
			fetch("http://localhost:5173/api/bgg", {
				method: "POST",
				body: JSON.stringify({ query }),
			})
				.then(res => res.json() as Promise<BGGSearchResponse>)
				.then(data => {
					bggSuggestions = data.items
						.filter(game => !existingIds.has(game.id))
						.map(game => ({
							value: game.id,
							label: `NEW: ${game.name} (${game.yearpublished})`,
							source: "bgg",
						}));
				});
		} else {
			bggSuggestions = [];
		}
	});

	const decodeHtml = (html: string) => {
		const txt = document.createElement("textarea");
		txt.innerHTML = html;
		return txt.value;
	};

	type PayloadThingPollNumPlayers = {
		name: string;
		title: string;
		totalvotes: string;
		results: Array<{
			numplayers: string;
			result: Array<{
				value: string;
				numvotes: string;
			}>;
		}>;
	};

	const extract = <TKey extends PropertyKey, TEntry extends { value: TKey }>(arr: TEntry[], key: NoInfer<TKey>) =>
		arr.find(res => res.value === key);

	$effect(() => {
		if (!selectedOption) return;
		if (selectedOption.game) {
			selectedGame = selectedOption.game;
			return;
		}

		bgg.thing({ id: [selectedOption.value], stats: true }).then(({ items: [ item ]}) => {
			if (!item) return;

			const suggestedNumPlayers = item.polls
				.find((poll): poll is PayloadThingPollNumPlayers => poll.name === "suggested_numplayers")
				?.results.filter(
					poll =>
						Number(extract(poll.result, "Best")!.numvotes) + Number(extract(poll.result, "Recommended")!.numvotes) >
						Number(extract(poll.result, "Not Recommended")!.numvotes),
				)
				.map(poll => Number(poll.numplayers)) ?? [Number(item.minPlayers), Number(item.maxPlayers)];

			selectedGame = {
				id: item.id,
				name: item.names[0].value,
				minPlayers: Math.min(...suggestedNumPlayers),
				maxPlayers: Math.max(...suggestedNumPlayers),
				minDuration: Number(item.minPlayTime),
				maxDuration: Number(item.maxPlayTime),
				description: decodeHtml(item.description),
				thumbnail: item.thumbnail ?? null,
				yearPublished: Number(item.yearPublished),
				rating: item.statistics ? Number(item.statistics.ratings.average) : null,
				complexity: item.statistics ? Number(item.statistics.averageWeight) : null,
				instanceId: instance.name,
				// isNew: true,
			};
		});
	});
</script>

<Combobox options={allAutoSuggestions} bind:query category="game" bind:selectedOption />
