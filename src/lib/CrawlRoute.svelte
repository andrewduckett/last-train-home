<script lang="ts">
	import type { CrawlProvider } from './data/provider.js';
	import Shell from './Shell.svelte';

	let { id, getCrawl }: { id: string; getCrawl?: CrawlProvider['getCrawl'] } = $props();
</script>

{#key id}
	<Shell {id} {getCrawl} />
{/key}
