<script lang="ts">
	import type { Crawl } from './types.js';
	import { detectMapsPlatform, directionsUrl, opensInNewTab } from './crawl/directions.js';

	let { crawl }: { crawl: Crawl } = $props();
	let definition = $derived(crawl.definition);

	const platform = detectMapsPlatform(globalThis.navigator?.userAgent);
	const newTab = opensInNewTab(platform);
</script>

<div data-testid="view-places" class="places-view">
	{#each definition.places as stop (stop.stop)}
		<div class="stop-card">
			<div class="stop-header">
				<span class="stop-label font-display">{stop.stop}</span>
				<span class="stop-town font-board">{stop.town}</span>
			</div>
			<div class="stop-locations">
				{#each stop.locations as location (location.name)}
					<div class="location-row">
						<div class="location-info">
							<div class="location-title">
								<span class="location-name">{location.name}</span>
								{#if location.label}
									<span class="location-label">{location.label}</span>
								{/if}
							</div>
							<div class="location-address">{location.address}</div>
						</div>
						<a
							href={directionsUrl([location.name, location.address, stop.town], platform)}
							target={newTab ? '_blank' : undefined}
							rel={newTab ? 'noopener noreferrer' : undefined}
							class="directions-link"
						>
							Directions
						</a>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>

<style>
	.places-view {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.stop-card {
		border-radius: 16px;
		overflow: hidden;
		background: var(--surface);
		border: 1px solid var(--line);
		box-shadow: 0 1px 2px var(--shadow);
	}

	.stop-header {
		display: flex;
		align-items: baseline;
		gap: 8px;
		padding: 10px 16px;
		background: var(--board);
	}

	.stop-label {
		font-weight: 700;
		font-size: 17px;
		letter-spacing: 0.04em;
		color: var(--board-accent);
	}

	.stop-town {
		font-size: 13px;
		color: var(--board-muted);
	}

	.stop-locations {
		padding: 8px;
	}

	.location-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 10px 12px;
	}

	/* A plain rule between rows; locations at one stop are not alternatives. */
	.location-row + .location-row {
		border-top: 1px solid var(--line);
	}

	.location-info {
		min-width: 0;
	}

	.location-title {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 8px;
		min-width: 0;
	}

	.location-name {
		min-width: 0;
		max-width: 100%;
		font-weight: 600;
		font-size: 16px;
		color: var(--ink);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.location-label {
		flex: 0 0 auto;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.04em;
		line-height: 1.4;
		padding: 0 7px;
		border-radius: 999px;
		color: var(--muted);
		border: 1px solid var(--line);
	}

	.location-address {
		font-size: 13px;
		color: var(--muted);
	}

	.directions-link {
		flex: 0 0 auto;
		font-size: 13px;
		font-weight: 600;
		border-radius: 20px;
		padding: 6px 12px;
		color: var(--accent-ink);
		border: 1px solid var(--accent);
		text-decoration: none;
		transition: transform 0.1s;
	}

	.directions-link:active {
		transform: scale(0.95);
	}
</style>
