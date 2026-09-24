<script lang="ts">
	import type { Crawl } from './types.js';

	let { crawl }: { crawl: Crawl } = $props();
	let definition = $derived(crawl.definition);

	function mapsUrl(name: string, address: string, town: string): string {
		return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${address}, ${town}, IL`)}`;
	}
</script>

<div data-testid="view-venues" class="venues-view">
	{#each definition.venues as venue (venue.stop)}
		<div class="venue-card">
			<div class="venue-header">
				<span class="venue-stop font-display">{venue.stop}</span>
				<span class="venue-town font-board">{venue.town}</span>
			</div>
			<div class="venue-places">
				{#each venue.places as place, idx (place.n)}
					{#if idx > 0}
						<div class="or-divider">
							<span class="or-line"></span>
							<span class="or-text">OR</span>
							<span class="or-line"></span>
						</div>
					{/if}
					<div class="place-row">
						<div class="place-info">
							<div class="place-name">{place.n}</div>
							<div class="place-address">{place.a}</div>
						</div>
						<a
							href={mapsUrl(place.n, place.a, venue.town)}
							target="_blank"
							rel="noopener noreferrer"
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
	.venues-view {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.venue-card {
		border-radius: 16px;
		overflow: hidden;
		background: var(--surface);
		border: 1px solid var(--line);
		box-shadow: 0 1px 2px var(--shadow);
	}

	.venue-header {
		display: flex;
		align-items: baseline;
		gap: 8px;
		padding: 10px 16px;
		background: var(--board);
	}

	.venue-stop {
		font-weight: 700;
		font-size: 17px;
		letter-spacing: 0.04em;
		color: var(--board-accent);
	}

	.venue-town {
		font-size: 13px;
		color: var(--board-muted);
	}

	.venue-places {
		padding: 8px;
	}

	.or-divider {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 12px;
		margin: 4px 0;
	}

	.or-line {
		height: 1px;
		flex: 1;
		background: var(--line);
	}

	.or-text {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.15em;
		color: var(--muted);
	}

	.place-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 10px 12px;
	}

	.place-info {
		min-width: 0;
	}

	.place-name {
		font-weight: 600;
		font-size: 16px;
		color: var(--ink);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.place-address {
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
