<script lang="ts" generics="T extends { id: string }">
	import type { Snippet } from "svelte";
	import { onDestroy, onMount, untrack } from "svelte";
	import { createSwapy, utils, type Swapy } from "swapy";
	import { flip } from "svelte/animate";
	import { send, receive } from "./transition";

	interface Props {
		items: T[];
		enabled?: boolean;
		onSwap?: (items: T["id"][]) => void;
		onSwapStart?: (items: T["id"][]) => void;
		snippet: Snippet<
			[
				{
					item: T;
					isDragging: boolean;
					update: () => void;
					enable: () => void;
					disable: () => void;
				},
			]
		>;
	}

	let { items, snippet, onSwapStart, onSwap, enabled = true }: Props = $props();

	let swapy: Swapy = $state(null as never);

	let slotItemMap = $state(utils.initSlotItemMap(items, "id"));
	let slottedItems = $derived(
		utils.toSlottedItems(
			untrack(() => items),
			"id",
			slotItemMap,
		),
	);

	let animationEnabled = $state(true);

	$effect(() => {
		items;
		untrack(async () => {
			const newSlotItemMap = utils.initSlotItemMap(items, "id");

			const itemChanged = newSlotItemMap.length !== slotItemMap.length || newSlotItemMap.some((item, index) => item.item !== slotItemMap[index].item);
			if (itemChanged) {
				slotItemMap = newSlotItemMap;
			}

			// slotItemMap = newSlotItemMap;
		});
	});

	let draggedElementId: string | null = $state(null);

	let container: HTMLElement;

	$effect(() => {
		enabled;
		untrack(() => swapy?.enable(enabled));
	});

	onMount(() => {
		swapy = createSwapy(container, {
			manualSwap: true,
			dragAxis: "y",
			enabled,
		});

		let initialOrder: string[];

		swapy.onSwap(event => {
			requestAnimationFrame(() => {
				slotItemMap = event.newSlotItemMap.asArray;
				console.log("event.newSlotItemMap.asArray", event.newSlotItemMap.asArray);
			});
		});

		swapy.onSwapStart(event => {
			draggedElementId = event.draggingItem;
			initialOrder = slottedItems.map(({ itemId }) => itemId);
			onSwapStart?.(initialOrder);
		});

		swapy.onSwapEnd(() => {
			draggedElementId = null;

			const hasChange = slottedItems.some(({ itemId }, index) => itemId !== initialOrder[index]);
			if (hasChange && onSwap) onSwap(slottedItems.map(({ itemId }) => itemId));

			// maybe need this?
			requestAnimationFrame(() => {
				swapy.update();
			});
		});
	});

	onDestroy(() => {
		swapy?.destroy();
	});

</script>

<div class="container contents" bind:this={container}>
	{#each slottedItems as { slotId, itemId, item }, i (slotId)}
		<div
			data-swapy-slot={slotId}
			animate:flip={{ duration: animationEnabled ? n => Math.sqrt(n) * 20 : 0 }}
			in:receive={{ key: slotId }}
			out:send={{ key: slotId }}
			onoutroend={() => swapy?.update()}
			onintroend={() => swapy?.update()}
		>
			{#if item}
				{#key itemId}
					<div data-swapy-item={itemId} data-isDragging={draggedElementId === itemId}>
						{@render snippet({
							item,
							isDragging: draggedElementId === itemId,
							update: () => swapy.update(),
							enable: () => swapy.enable(enabled),
							disable: () => {
								draggedElementId = null;
								swapy.enable(false);
							},
						})}
					</div>
				{/key}
			{/if}
		</div>
	{/each}
</div>

<style>
	[data-isDragging] {
		will-change: transform;
	}
</style>
