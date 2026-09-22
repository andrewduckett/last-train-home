<script lang="ts">
	import type { Crawl } from './types.js';

	let { crawl }: { crawl: Crawl } = $props();
	let definition = $derived(crawl.definition);

	let tabs = $derived(definition.schedule);

	function mapsUrl(name: string, address: string, town: string): string {
		return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${address}, ${town}, IL`)}`;
	}
	void mapsUrl;
</script>

<div data-testid="view-schedule">
	<div class="quick-links">
		<a href={definition.ventraUrl} target="_blank" rel="noopener noreferrer" class="quick-link">
			<span class="quick-link-label font-display">Ventra</span>
			<span class="quick-link-hint">Buy &amp; show your pass</span>
		</a>
		<a href={definition.metraUrl} target="_blank" rel="noopener noreferrer" class="quick-link">
			<span class="quick-link-label font-display">Metra</span>
			<span class="quick-link-hint">Live train schedules</span>
		</a>
	</div>

	<section class="rail-track">
		{#each tabs as entry, i (i)}
			{@const isDepart = entry.kind === 'depart'}
			<div class="timeline-entry" class:last={i === tabs.length - 1}>
				<span class="dot" class:dot-depart={isDepart} class:dot-stop={!isDepart}>
					{#if isDepart}<span class="dot-inner"></span>{/if}
				</span>
				<div class="entry-card">
					<div class="entry-header">
						<span class="time-pill">{entry.t}</span>
						<span class="entry-tag" class:tag-depart={isDepart} class:tag-stop={!isDepart}>
							{isDepart ? '▶ ' : '◉ '}{entry.tag}
						</span>
					</div>
					<div class="entry-title font-display">{entry.title}</div>
					{#if entry.sub}<div class="entry-sub">{entry.sub}</div>{/if}
				</div>
			</div>
		{/each}
	</section>
</div>

<style>
	.quick-links {
		display: flex;
		gap: 12px;
		margin-bottom: 20px;
	}

	.quick-link {
		flex: 1;
		border-radius: 16px;
		padding: 12px 16px;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		background: var(--surface);
		border: 1px solid var(--line);
		box-shadow: 0 1px 2px var(--shadow);
		text-decoration: none;
		transition: transform 0.1s;
	}

	.quick-link:active {
		transform: scale(0.98);
	}

	.quick-link-label {
		font-weight: 600;
		font-size: 17px;
		letter-spacing: 0.04em;
		color: var(--ink);
	}

	.quick-link-hint {
		font-size: 12px;
		margin-top: 2px;
		color: var(--muted);
	}

	.timeline-entry {
		position: relative;
		padding-left: 36px;
		padding-bottom: 20px;
	}

	.timeline-entry.last {
		padding-bottom: 0;
	}

	.dot {
		position: absolute;
		left: 0;
		top: 4px;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: 3px solid;
		display: grid;
		place-items: center;
	}

	.dot-depart {
		background: var(--rail);
		border-color: var(--rail);
	}

	.dot-stop {
		background: var(--surface);
		border-color: var(--accent);
	}

	.dot-inner {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #fff;
	}

	.entry-card {
		border-radius: 16px;
		padding: 14px;
		background: var(--surface);
		border: 1px solid var(--line);
		box-shadow: 0 1px 2px var(--shadow);
	}

	.entry-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 6px;
	}

	.entry-tag {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.12em;
	}

	.tag-depart {
		color: var(--rail);
	}

	.tag-stop {
		color: var(--accent-ink);
	}

	.entry-title {
		font-weight: 600;
		font-size: 18px;
		line-height: 1.3;
		color: var(--ink);
	}

	.entry-sub {
		font-size: 13.5px;
		margin-top: 2px;
		color: var(--muted);
	}
</style>
