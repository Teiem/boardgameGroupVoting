<script lang="ts">
	import type { AvailableGame, Game } from "@prisma/client";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Accordion from "$lib/components/ui/accordion/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";

	import BadgeWithTooltip from "../badgeWithTooltip/badgeWithTooltip.svelte";
	import { onDestroy, onMount, type Component } from "svelte";

	import {
		ChevronDown,
		ChevronUp,
		GripVertical,
		ArrowDown,
		ArrowUp,
		Users,
		Clock,
		Star,
		Brain,
		Check,
		User,
		Edit,
		Trash2,
	} from "lucide-svelte";
	import { Badge } from "../badge";
	import { draw } from "svelte/transition";
	import { cn } from "$lib/utils";
	import { Button } from "../button";
	import { updateAvailableGame, user } from "$lib/state/state.svelte";
	import GameSettings from "../addGame/gameSettings.svelte";
	import { toast } from "svelte-sonner";

	interface Props {
		game: Game;
		isDragging: boolean;
		availableGame: Pick<AvailableGame, "ownerId" | "isPromoted" | "id">;
		enable: () => void;
		disable: () => void;
		onSuccess: () => void;
	}

	let { game = $bindable(), isDragging, enable, disable, onSuccess, availableGame = $bindable() }: Props = $props();

	let el: HTMLElement = $state(null as never);
	let root: HTMLElement = $state(null as never);

	const drawDistance = 75;

	const preventDefault = (e: Event) => e.preventDefault();

	let isSliding = $state(false);

	onMount(() => {
		return;
		const checks = [...root.querySelectorAll<HTMLElement>("[data-check]")] as [HTMLElement, HTMLElement];

		let initialX = 0;
		let initialY = 0;
		let dx = 0;
		let dy = 0;

		let success = false;

		let minDragReached = false;

		let requestAnimationFrameQueued = false;
		let animationFrame: number | null = null;

		const updateStyle = () => {
			if (requestAnimationFrameQueued) return;

			animationFrame = requestAnimationFrame(() => {
				requestAnimationFrameQueued = false;
				const eased = Math.sign(dx) * Math.pow(Math.abs(dx), 0.85);
				el.style.transform = `translateX(${eased}px)`;

				const prevSuccess = success;
				success = drawDistance < Math.abs(eased);
				const newSuccess = !prevSuccess && success;

				checks.forEach(async (check, i) => {
					if (newSuccess) {
						const successScale = "1.325";

						await check.animate([{ scale: "1" }, { scale: successScale }], {
							duration: 300,
							easing:
								"linear(0, 0.544 5.5%, 0.947 11.5%, 1.213 18.1%, 1.298 21.7%, 1.352 25.5%, 1.372 28.2%, 1.379 31.1%, 1.374 34.2%, 1.357 37.6%, 1.307 43.7%, 1.121 61.8%, 1.074 67.8%, 1.04 73.7%, 1.007 84.7%, 1)",
						}).finished;

						check.style.scale = successScale;
					} else if (!success) {
						const successFactor = success ? 1.25 : 1;
						const easedFraction = Math.abs(eased) / drawDistance;

						const opacity = easedFraction;
						check.style.opacity = opacity.toString();

						const scale = Math.min(easedFraction, 1) * successFactor;
						check.style.scale = scale.toString();
					}
				});
			});
		};

		const onPointerDown = (e: PointerEvent) => {
			e.preventDefault(); // needed?
			if ((e.target as HTMLElement).closest("[data-intractable]")) return;

			el.getAnimations().forEach(animation => animation.cancel());

			isSliding = true;

			document.addEventListener("pointerup", onPointerUp, { once: true });
			document.addEventListener("pointermove", onPointerMove, { passive: false });
			document.documentElement.addEventListener("mouseleave", () => onPointerUp, { once: true });

			if (animationFrame) cancelAnimationFrame(animationFrame);
			animationFrame = null;

			minDragReached = false;
			success = false;
			initialX = e.clientX;
			initialY = e.clientY;
		};

		const onPointerMove = (e: PointerEvent) => {

			e.preventDefault();
			dx = e.clientX - initialX;
			dy = e.clientY - initialY;

			updateStyle();

			if (!minDragReached && dx * dx + dy * dy > 25) {
				minDragReached = true;

				if (Math.abs(dx) > Math.abs(dy)) {
					el.addEventListener("touchmove", preventDefault, { passive: false });
					disable();
				} else {
					onPointerUp();
				}
			}
		};

		const onPointerUp = async () => {
			dx = 0;
			dy = 0;

			if (animationFrame) cancelAnimationFrame(animationFrame);
			animationFrame = null;

			document.removeEventListener("pointermove", onPointerMove);

			if (!el) return;
			el.removeEventListener("touchmove", preventDefault);

			const animation = el.animate([{ transform: `translateX(0px)` }], {
				duration: 75,
				easing: "ease-out",
			});

			await animation.finished;
			if (!el) return;

			el.style.transform = `translateX(0px)`;
			isSliding = false;
			enable();

			if (success) onSuccess();
		};

		el.addEventListener("pointerdown", onPointerDown, { passive: false });
	});

	let isSettingsOpen = $state(false);
	let isDeletingOpen = $state(false);

	const inEditCopy = $state({
		isPromoted: availableGame.isPromoted,
		game: { ...game },
	});
</script>

<div
	class="group grid"
	bind:this={root}
	data-isDragging={isDragging}
	data-isSliding={isSliding}
	data-isPromoted={availableGame.isPromoted}
	data-isOwnGame={user.id === availableGame.ownerId}
>
	<div
		class="align-center col-span-full row-span-full m-[2px] flex justify-between rounded-md bg-green-300 p-[30px] group-data-[isDragging=true]:hidden group-data-[isSliding=false]:hidden"
	>
		<Check data-check class="h-6 w-6 text-green-500" />
		<Check data-check class="h-6 w-6 text-green-500" />
	</div>
	<Accordion.Item class="col-span-full row-span-full select-none border-none" bind:ref={el}>
		<Card.Root class={cn("game-card px-3 pb-3 pt-2")}>
			<Card.Header class="pt-0">
				<div class="flex flex-1 flex-col justify-between font-medium transition-all">
					<div class="flex flex-1 items-center justify-between">
						<div class="flex items-center gap-2">
							{#if game.thumbnail}
								<img src={game.thumbnail} alt="" />
							{/if}
							<Card.Title>{game.name}</Card.Title>
						</div>
						<div class="flex items-center" data-intractable data-swapy-no-drag>
							<Accordion.Trigger>
							</Accordion.Trigger>
						</div>
					</div>

					<div class="mt-1 flex flex-wrap gap-2">
						<Badge
							variant="secondary"
							class="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 dark:bg-gray-800"
						>
							<User class="h-3.5 w-3.5" />
							<span class="text-xs font-medium">{game.minPlayers} - {game.maxPlayers}</span>
						</Badge>
						<Badge
							variant="secondary"
							class="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 dark:bg-gray-800"
						>
							<Clock class="h-3.5 w-3.5" />
							<span class="text-xs font-medium">{game.minDuration} - {game.maxDuration}</span>
						</Badge>
						<Badge
							variant="secondary"
							class="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 dark:bg-gray-800"
						>
							<Brain class="h-3.5 w-3.5" />
							<span class="text-xs font-medium">{game.complexity?.toFixed(1)}</span>
						</Badge>
						<Badge
							variant="secondary"
							class="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 dark:bg-gray-800"
						>
							<Star class="h-3.5 w-3.5" />
							<span class="text-xs font-medium">{game.rating?.toFixed(1)}</span>
						</Badge>
					</div>
				</div>
				<Accordion.Content>
					<Card.Description class="mt-4">{game.description}</Card.Description>
					{#if user.id === availableGame.ownerId}
						<div data-intractable data-swapy-no-drag class="flex items-center justify-end pt-2">
							<Dialog.Root bind:open={isSettingsOpen}>
								<Dialog.Trigger>
									{#snippet child({ props: triggerProps })}
										<Button {...triggerProps} variant="ghost"><Edit></Edit></Button>
									{/snippet}
								</Dialog.Trigger>
								<Dialog.Overlay />
								<Dialog.Content class="dialog-content auto-rows-min">
									<Dialog.Header>
										<Dialog.Title>{game.name}</Dialog.Title>
										<Dialog.Description>Edit Game</Dialog.Description>
									</Dialog.Header>

									<GameSettings
										bind:selectedGame={inEditCopy.game}
										bind:isPromoted={inEditCopy.isPromoted}
										onsubmit={() => {
											updateAvailableGame(
												{ id: availableGame.id, isPromoted: inEditCopy.isPromoted },
												inEditCopy.game,
											);
											isSettingsOpen = false;
											availableGame.isPromoted = inEditCopy.isPromoted;
											game = inEditCopy.game;
										}}
										ctaTitle="Save Changes"
									></GameSettings>
								</Dialog.Content>
							</Dialog.Root>

							<Dialog.Root bind:open={isDeletingOpen}>
								<Dialog.Trigger>
									{#snippet child({ props: triggerProps })}
										<Button {...triggerProps} variant="destructive"><Trash2 /></Button>
									{/snippet}
								</Dialog.Trigger>
								<Dialog.Overlay />
								<Dialog.Content>
									<Dialog.Header>
										<Dialog.Title>Removing {game.name}</Dialog.Title>
										<Dialog.Description
											>Are you sure you want to remove {game.name} from the games you brought?</Dialog.Description
										>
									</Dialog.Header>

									<div class="flex justify-end gap-2">
										<Button
											variant="secondary"
											onclick={() => {
												isDeletingOpen = false;
											}}>Cancel</Button
										>
										<Button
											variant="destructive"
											onclick={() => {
												isDeletingOpen = false;
												// deleteAvailableGame(availableGame.id);
												toast.success(game.name + " has been removed.");
											}}><Trash2 />Remove</Button
										>
									</div>
								</Dialog.Content>
							</Dialog.Root>
						</div>
					{/if}
				</Accordion.Content>
			</Card.Header>
			<!-- <Accordion.Content>
				<Card.Content></Card.Content>
			</Accordion.Content> -->
		</Card.Root>
	</Accordion.Item>
</div>

<style>
	[data-IsPromoted="true"] :global(.game-card) {
		border-left: 4px solid var(--yellow-4);
	}

	[data-IsOwnGame="true"] :global(.game-card) {
		border-right: 4px solid var(--blue-4);
	}

	div :global(.game-card) {
		transition:
			box-shadow 0.1s ease-out,
			rotate 0.1s ease-out,
			scale 0.1s ease-out;
	}

	:global([data-swapy-dragging]) div :global(.game-card) {
		transition: none;
	}

	:global([data-swapy-dragging]) :global(.game-card) {
		box-shadow: var(--shadow-elevation-medium);
		/* rotate: -0.5deg; */
		/* animation: wiggle 0.5s infinite; */
		/* scale: 1.01; */
	}

	@keyframes wiggle {
		0% {
			transform: rotate(0deg);
		}
		50% {
			transform: rotate(1deg);
		}
		100% {
			transform: rotate(0deg);
		}
	}

	img {
		max-height: 1.25lh;
		border-radius: 0.25rem;
	}
</style>
