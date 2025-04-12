<script lang="ts">
	import Input from "$lib/components/ui/input/input.svelte";
	import Label from "$lib/components/ui/label/label.svelte";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import type { Snippet } from "svelte";
	import * as Card from "$lib/components/ui/card/index.js";

	interface Props {
		min: number;
		max: number;
		title: string;
		step: number;
		value: [number, number];
		head?: Snippet<[Pick<typeof Card, "Title" | "Description">]>;
	}

	let { min, max, step, value = $bindable(), head, title }: Props = $props();
</script>

<Card.Root>
	<Card.Content class="grid space-y-6">
		{#if head}
			<Card.Header>
				{@render head(Card)}
			</Card.Header>
		{/if}

		<Slider
			class="py-4"
			type="multiple"
			{value}
			{min}
			{max}
      onValueCommit={([ min, max ]) => {
        value = [
          Math.floor(min / step) * step,
          Math.floor(max / step) * step
        ];
      }}
			onValueChange={([ min, max ]) => {
				value = [ min, max ];
			}}

		></Slider>
		<div class="grid grid-cols-2 gap-4">
			<div class="flex flex-col gap-1">
				<Label for="min-{title}">Min {title}</Label>
				<Input
					class="field-sizing-content"
					type="number"
					id="min-{title}"
					name="min-{title}"
					{min}
					max={value[1]}
					{step}
          value={value[0]}
          onchange={e => {
            value = [value[1], Math.min(Math.max(Number(e.currentTarget.value), value[1]), max)];
          }}
				/>
			</div>
			<div class="flex flex-col gap-1">
				<Label for="max-{title}">Max {title}</Label>
				<Input
					class="field-sizing-content"
					type="number"
					id="max-{title}"
					name="max-{title}"
					min={value[0]}
					{max}
					{step}
          value={value[1]}
          onchange={e => {
            value = [value[0], Math.min(Math.max(Number(e.currentTarget.value), value[0]), max)];
          }}
				/>
			</div>
		</div>
	</Card.Content>
</Card.Root>
