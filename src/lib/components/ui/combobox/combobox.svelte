<script
	lang="ts"
	generics="Option extends {
  value: string;
  label: string;
}"
>
	import Check from "lucide-svelte/icons/check";
	import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
	import { tick } from "svelte";
	import * as Command from "$lib/components/ui/command/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils.js";

	interface Props {
		category: string;
		options: Option[];
		selectedOption?: Option | null;
		query?: string;
	}

	let { category = "Game", options, selectedOption = $bindable(null), query = $bindable("") }: Props = $props();

	let open = $state(true);
	let triggerRef = $state<HTMLButtonElement>(null!);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button variant="outline" class="w-[100%] justify-between overflow-hidden" {...props} role="combobox" aria-expanded={open}>
				{selectedOption?.label || `Select a ${category}...`}
				<ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="p-0 PopoverContent">
		<Command.Root shouldFilter={false}>
			<Command.Input bind:value={query} placeholder={`Search ${category}s...`} />
			<Command.List>
				<Command.Empty>No {category} Found</Command.Empty>
				<Command.Group>
					{#each options as option}
						<Command.Item
							value={option.value}
							onSelect={() => {
								query = option.label;
								selectedOption = option;
								closeAndFocusTrigger();
							}}
						>
							<Check class={cn("mr-2 size-4", query !== option.value && "text-transparent")} />
							{option.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

<style>
	:global(.PopoverContent) {
		width: var(--bits-popover-anchor-width);
		text-overflow: unset;
	}
</style>