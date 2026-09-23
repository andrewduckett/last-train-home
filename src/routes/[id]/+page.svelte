<script lang="ts">
	import { page } from '$app/state';
	import CrawlRoute from '$lib/CrawlRoute.svelte';

	let id = $derived(page.params.id ?? '');
</script>

<svelte:head>
	<title>Last Train Home</title>
</svelte:head>

<CrawlRoute {id} />
