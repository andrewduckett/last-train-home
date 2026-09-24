<script lang="ts">
	import type { Crawl } from './types.js';
	import { resolveLinks } from './crawl/urls.js';

	let { crawl }: { crawl: Crawl } = $props();
	let intro = $derived(typeof crawl.definition?.intro === 'string' && crawl.definition.intro.trim() ? crawl.definition.intro : '');
	let links = $derived(resolveLinks(crawl.definition?.links));
</script>

<div data-testid="view-info" class="info-view">
	{#if intro}<p class="intro-card">{intro}</p>{/if}
	{#if links.length > 0}
		<div class="quick-links">
			{#each links as link}
				<a href={link.url} target="_blank" rel="noopener noreferrer" class="quick-link">
				<span class="quick-link-label font-display">{link.label}</span>
				{#if link.hint}<span class="quick-link-hint">{link.hint}</span>{/if}
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.info-view { display: flex; flex-direction: column; gap: 16px; }
	.intro-card { padding: 16px; border-radius: 16px; background: var(--surface); border: 1px solid var(--line); color: var(--ink); overflow-wrap: anywhere; }
	.quick-links { display: grid; gap: 12px; }
	.quick-link { min-width: 0; min-height: 52px; overflow-wrap: anywhere; border-radius: 16px; padding: 12px 16px; display: flex; flex-direction: column; justify-content: center; background: var(--surface); border: 1px solid var(--line); box-shadow: 0 1px 2px var(--shadow); text-decoration: none; }
	.quick-link:active { transform: scale(0.98); }
	.quick-link-label { font-weight: 600; font-size: 17px; letter-spacing: 0.04em; color: var(--ink); }
	.quick-link-hint { font-size: 12px; margin-top: 2px; color: var(--muted); }
</style>
