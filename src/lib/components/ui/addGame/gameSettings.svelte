<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import Label from "$lib/components/ui/label/label.svelte";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import type { Game, Prisma } from "@prisma/client";
	import { User, Clock } from "lucide-svelte";
	import RangeSelect from "../rangeSelect/rangeSelect.svelte";

	interface Props {
		selectedGame: Prisma.GameUncheckedCreateInput;
		isPromoted: boolean;
		ctaTitle?: string;
		onsubmit: (e: SubmitEvent) => void;
	}

	let { selectedGame = $bindable(), onsubmit, isPromoted = $bindable(), ctaTitle = "Add"}: Props = $props();

	let isDescriptionOpen = $state(false);

	const MAX_DESCRIPTION_LENGTH = 200;
	const EVALUATION = {
		nextSpace: 1,
		nextPunctuation: 25,
		nextNewline: 50,
	};

	const descriptionShort = $derived.by(() => {
		if (!selectedGame) return "";
		if (selectedGame.description.length <= MAX_DESCRIPTION_LENGTH) return selectedGame.description;

		const nextSpace = selectedGame.description.substring(MAX_DESCRIPTION_LENGTH).search(" ");
		const nextPunctuation = selectedGame.description.substring(MAX_DESCRIPTION_LENGTH).search(/[.!?]/);
		const nextNewline = selectedGame.description.substring(MAX_DESCRIPTION_LENGTH).search("\n");

		const { charCount } = [
			{
				charCount: nextSpace,
				value: nextSpace / EVALUATION.nextSpace,
			},
			{
				charCount: nextPunctuation + 1,
				value: nextPunctuation / EVALUATION.nextPunctuation,
			},
			{
				charCount: nextNewline,
				value: nextNewline / EVALUATION.nextNewline,
			},
		].reduce((acc, curr) => (curr.value < acc.value ? curr : acc), { value: Infinity } as {
			charCount: number;
			value: number;
		});

		return selectedGame.description.substring(0, MAX_DESCRIPTION_LENGTH + charCount);
	});

  const duration = $derived([selectedGame!.minDuration, selectedGame!.maxDuration] as [number, number]);
  const playerCount = $derived([selectedGame!.minPlayers, selectedGame!.maxPlayers] as [number, number]);
</script>

<form {onsubmit} class="flex flex-col gap-8">
	<Collapsible.Root bind:open={isDescriptionOpen}>
		<Collapsible.Trigger class="text-left">
			<Label for="description">Description</Label>

			{#if !isDescriptionOpen}
				<p id="description" contenteditable="false">{descriptionShort}</p>
			{/if}
		</Collapsible.Trigger>
		<Collapsible.Content>
			<p id="description" contenteditable="true">{selectedGame.description}</p>
		</Collapsible.Content>
	</Collapsible.Root>

	<RangeSelect
		title="Duration"
		min={0}
		max={240}
		step={15}
		bind:value={
			() => duration,
			([min, max]) => {
				selectedGame!.minDuration = min;
				selectedGame!.maxDuration = max;
			}
		}
	>
		{#snippet head({ Title, Description })}
			<Title class="text-xl font-semibold leading-none tracking-tight flex items-center gap-2"><Clock size={20} /><span>Duration</span></Title>
			<Description>How long does a game usually take?</Description>
		{/snippet}
	</RangeSelect>

	<RangeSelect
		title="Players"
		min={2}
		max={15}
		step={1}
		bind:value={
			() => playerCount,
			([min, max]) => {
				selectedGame!.minPlayers = min;
				selectedGame!.maxPlayers = max;
			}
		}
	>
		{#snippet head({ Title, Description })}
			<Title class="text-xl font-semibold leading-none tracking-tight flex items-center gap-2"><User size={20} /><span>Player Count</span></Title>
			<Description>What is the ideal number of players?</Description>
		{/snippet}
	</RangeSelect>

	<div class="flex items-center space-x-2 py-2">
		<Switch id="featured" bind:checked={isPromoted} />
		<Label for="featured">Featured</Label>
	</div>

	<Button variant="default" type="submit">{ctaTitle}</Button>
</form>
