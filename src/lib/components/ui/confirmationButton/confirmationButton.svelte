<!-- <script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog/index.js";

  interface Props {
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText: string;
    cancelText: string;
  }

  let {}: Props = $props();
</script>

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
        updateAvailableGameAndGame({ id: availableGame.id, isPromoted: inEditCopy.isPromoted }, inEditCopy.game);
        isSettingsOpen = false;
        availableGame.isPromoted = inEditCopy.isPromoted;
        game = inEditCopy.game;
      }}
      ctaTitle="Save Changes"
    ></GameSettings>
  </Dialog.Content>
</Dialog.Root> -->