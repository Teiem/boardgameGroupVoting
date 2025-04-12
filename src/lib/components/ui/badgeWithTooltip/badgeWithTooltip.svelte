<script lang="ts">
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import { cn } from "$lib/utils.js";
	import type { ComponentProps, Snippet } from "svelte";

	interface Props extends ComponentProps<typeof Badge> {
		title?: string;
		triggerClass?: string;
    children?: Snippet<[]>;
  }

	let { title, triggerClass, children, ...restProps }: Props = $props();
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger
			class={cn("flex", triggerClass)}
			onclick={e => {
				e.stopPropagation();
				e.preventDefault();
			}}
		>
			<Badge variant="secondary" {...restProps}>
        {@render children?.()}
      </Badge>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>{title}</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
