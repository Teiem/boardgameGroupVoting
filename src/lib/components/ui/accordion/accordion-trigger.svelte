<script lang="ts">
	import { Accordion as AccordionPrimitive, type WithoutChild } from "bits-ui";
	import ChevronDown from "lucide-svelte/icons/chevron-down";
	import { cn } from "$lib/utils.js";
	import { Button } from "../button";

	let {
		ref = $bindable(null),
		class: className,
		level = 3,
		children,
		...restProps
	}: WithoutChild<AccordionPrimitive.TriggerProps> & {
		level?: AccordionPrimitive.HeaderProps["level"];
	} = $props();
</script>

<AccordionPrimitive.Header {level} class="flex">
	<AccordionPrimitive.Trigger
		bind:ref
		class={cn(
			"flex flex-1 items-center justify-between font-medium transition-all [&[data-state=open]>button>svg]:rotate-180",
			className
		)}
		{...restProps}
	>
			{#snippet child({ props })}
				{@render children?.()}
				<Button variant="ghost" size="sm" {...props}>
					<ChevronDown class="size-4 shrink-0 transition-transform duration-200" />
				</Button>
			{/snippet}
	</AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
