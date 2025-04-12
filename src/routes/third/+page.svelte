<script lang="ts">
	import { main } from "$lib/compute/chatgpt";
	import { onMount } from "svelte";


	onMount(() => {
		main();
	});
</script>