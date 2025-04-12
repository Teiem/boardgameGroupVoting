<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
	import Input from "$lib/components/ui/input/input.svelte";
	import Label from "$lib/components/ui/label/label.svelte";
	import GameSelect from "$lib/components/ui/gameSelect/gameSelect.svelte";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { ChevronsUpDown } from "lucide-svelte";
	import { addAvailableGame, user } from "$lib/state/state.svelte.js";
	import { Plus } from "lucide-svelte";
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";

	import type { ComponentProps } from "svelte";
	import type { Game, Prisma } from "@prisma/client";
	import { Checkbox } from "bits-ui";
	import RangeSelect from "../rangeSelect/rangeSelect.svelte";
	import { ChevronDown, ChevronUp, GripVertical, ArrowDown, ArrowUp, Users, Clock, Star, Brain, Check, User, Edit, Trash2 } from "lucide-svelte";
	import GameSettings from "./gameSettings.svelte";
	import { toast } from "svelte-sonner";

	interface Props {
		existingGames: Game[];
		hasPromotedGame: boolean;
	}

	let { existingGames, hasPromotedGame }: Props = $props();

	let open = $state(false);

	let selectedGame = $state<ComponentProps<typeof GameSelect>["selectedGame"]>(null);

	const onSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		if (!selectedGame) return;

		const toastId = toast.loading(selectedGame.name + "is being added...");

		await addAvailableGame(
			{
				ownerId: user.id,
				gameId: selectedGame.id,
				isPromoted,
				isOthersAllowed: true,
			} satisfies Prisma.AvailableGameUncheckedCreateInput,
			selectedGame,
		);

		open = false;
		toast.success(selectedGame.name + "has been added.", {
			id: toastId,
		});
	};

	let isPromoted = $state(!hasPromotedGame);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props: triggerProps })}
			<Button {...triggerProps} variant="outline" size="lg">
				<Plus class="mr-2 h-5 w-5" />
				Add Game
			</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Overlay />
	<Dialog.Content class="dialog-content auto-rows-min">
		<Dialog.Header>
			<Dialog.Title>Adding a Game</Dialog.Title>
			<Dialog.Description>Choose a game you would like to add to the list.</Dialog.Description>
		</Dialog.Header>

		<GameSelect {existingGames} bind:selectedGame></GameSelect>

		{#if selectedGame}
			<GameSettings bind:selectedGame bind:isPromoted onsubmit={onSubmit}></GameSettings>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- <style>
	form {
		display: grid;
		align-items: center;
	}
</style> -->
