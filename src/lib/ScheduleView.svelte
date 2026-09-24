<script lang="ts">
	import type { Crawl } from './types.js';
	import { resolveSchedule } from './crawl/schedule.js';

	let { crawl }: { crawl: Crawl } = $props();
	let definition = $derived(crawl.definition);

	let tabs = $derived(resolveSchedule(definition?.schedule));

</script>

<div data-testid="view-schedule">
	<section class="rail-track">
		{#if tabs.length === 0}<p role="status">Schedule unavailable.</p>{/if}
		{#each tabs as entry, i (i)}
			<div class="timeline-entry" data-kind={entry.kind} class:last={i === tabs.length - 1}>
				<span class="dot dot-{entry.kind}">
					{#if entry.kind === 'move'}<span class="dot-inner"></span>{/if}
				</span>
				<div class="entry-card">
					<div class="entry-header">
						<span class="time-pill">{entry.time}</span>
						<span class="entry-tag tag-{entry.kind}">
							{entry.tag ?? (entry.kind === 'stop' ? 'Stop' : entry.kind === 'move' ? 'Move' : 'Note')}
						</span>
					</div>
					<div class="entry-title font-display">{entry.title}</div>
					{#if entry.kind === 'move'}<div class="entry-sub">{entry.mode}</div>{/if}
					{#if entry.note}<div class="entry-sub">{entry.note}</div>{/if}
				</div>
			</div>
		{/each}
	</section>
</div>

<style>
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

	.dot-move {
		background: var(--rail);
		border-color: var(--rail);
	}

	.dot-stop {
		background: var(--surface);
		border-color: var(--accent);
	}

	.dot-note { background: var(--surface); border-color: var(--muted); }

	.dot-inner {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--on-good);
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

	.tag-move {
		color: var(--rail);
	}

	.tag-stop {
		color: var(--accent-ink);
	}

	.tag-note { color: var(--muted); }

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
