<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Plus, Trash2 } from "lucide-svelte";
	import { reactivateAvailableGame, removeAvailableGame, type AvailableGame } from "$lib/state/state.svelte";
  import { toast } from "svelte-sonner";


	interface Props {
		lastGames: AvailableGame[];
	}

	let { lastGames = $bindable() }: Props = $props();


  const restoreGames = async (games: AvailableGame[]) => {
    if (!games.length) {
      toast.error("No games selected");
      return;
    }

    lastGames = lastGames.filter(game => !games.some(g => g.id === game.id));

    const toastId = toast.loading(`Restoring ${games.length} games...`);

    await Promise.all(games.map(reactivateAvailableGame));

    toast.success(`Restored ${games.length} games`, { id: toastId });
    open = false;
  };

  const restoreAllGames = () => restoreGames(lastGames);
  const restoreSelectedGames = () => restoreGames(withSelect.filter(game => game.selected));

	let withSelect = $state(
		lastGames.map(game => ({
			...game,
			selected: false,
		})),
	);

  let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props: triggerProps })}
			<Button {...triggerProps} variant="outline" size="lg">
				<Plus class="mr-2 h-5 w-5" />
				Add Games From Last Time ({lastGames.length})
			</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add Previous Games</Dialog.Title>
			<Dialog.Description>Select games you've brought before to add them again.</Dialog.Description>
		</Dialog.Header>
		<ScrollArea class="flex-1 rounded-md border p-4">
			<ul class="flex flex-col gap-2">
				{#each withSelect as lastAvailableGame}
					<li class="flex items-center justify-between">
						<label class="flex items-center gap-2">
							<Checkbox bind:checked={lastAvailableGame.selected} />
							<span>{lastAvailableGame.game.name}</span>
						</label>
            <Button variant="ghost" size="icon" onclick={() => {
              removeAvailableGame(lastAvailableGame.id)
              lastGames = lastGames.filter(game => game.id !== lastAvailableGame.id);
              withSelect = withSelect.filter(game => game.id !== lastAvailableGame.id);

              if (!lastGames.length) {
                open = false;
                toast.info("removed all games");
              }
            }}>
              <Trash2 />
            </Button>
					</li>
				{/each}
			</ul>
		</ScrollArea>
		<div class="buttons flex justify-end gap-2">
			<Button variant="outline" onclick={() => { open = false }}>Cancel</Button>
			<Button variant="secondary" onclick={restoreAllGames}>Add All ({lastGames.length})</Button>
			<Button variant="default" disabled={!withSelect.some(game => game.selected)} onclick={restoreSelectedGames}>Add Selected ({withSelect.filter(game => game.selected).length})</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>

<style>
</style>
