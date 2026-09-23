<script lang="ts">
	import type { Crawl } from './types.js';
	import { resolveMap } from './crawl/urls.js';

	let { crawl }: { crawl: Crawl } = $props();
	let definition = $derived(crawl.definition);

	let map = $derived(resolveMap(definition?.map));
</script>

<div data-testid="view-map" class="map-view">
	{#if map}
		<div class="map-frame-wrap">
		<iframe
			title="Crawl route map"
			src={map.embed}
			class="map-frame"
			loading="lazy"
			referrerpolicy="no-referrer-when-downgrade"
		></iframe>
		</div>

	<a
		href={map.app}
		target="_blank"
		rel="noopener noreferrer"
		class="map-open-btn font-display"
		data-testid="map-viewer-link"
	>
		📍 Open in Google Maps App
	</a>
	{:else}
		<p class="map-notice" role="status">Map unavailable.</p>
	{/if}
</div>

<style>
	.map-view {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.map-notice {
		border-radius: 12px;
		padding: 12px 14px;
		font-size: 13px;
		line-height: 1.6;
		background: rgba(201, 118, 42, 0.12);
		border: 1px solid var(--accent);
		color: var(--accent-ink);
	}

	.map-frame-wrap {
		border-radius: 16px;
		overflow: hidden;
		border: 1px solid var(--line);
		box-shadow: 0 1px 3px var(--shadow);
		aspect-ratio: 3 / 4;
	}

	.map-frame {
		width: 100%;
		height: 100%;
		border: none;
		display: block;
	}

	.map-open-btn {
		display: block;
		width: 100%;
		text-align: center;
		border-radius: 16px;
		padding: 16px 20px;
		font-weight: 600;
		font-size: 19px;
		letter-spacing: 0.04em;
		background: var(--accent);
		color: #1a1206;
		box-shadow: 0 2px 8px var(--shadow);
		text-decoration: none;
		transition: transform 0.1s;
	}

	.map-open-btn:active {
		transform: scale(0.99);
	}
</style>
