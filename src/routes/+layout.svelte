<script lang="ts">
	import { Toaster } from "$lib/components/ui/sonner/index.js";
	import "../app.css";
	import "../styles/global.css";

	let { children } = $props();
</script>

{@render children()}

<Toaster />