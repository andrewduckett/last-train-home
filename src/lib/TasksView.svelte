<script lang="ts">
	import type { Crawl } from './types.js';
	import type { ChecksController } from './checks.svelte.js';

	let { crawl, controller }: { crawl: Crawl; controller: ChecksController } = $props();

	let { scavenger, scavengerRules } = $derived(crawl.definition);

	let total = $derived(scavenger.reduce((s, i) => s + i.points, 0));

	let earned = $derived(scavenger.reduce((s, i) => s + (Object.hasOwn(controller.checks, i.id) ? i.points : 0), 0));
	let pct = $derived(Math.round((earned / total) * 100));

	function resetScavenger() {
		if (confirm('Clear these checkmarks?')) {
			controller.reset();
		}
	}
</script>

<div data-testid="view-tasks" class="tasks-view">
	<!-- How to score card -->
	<div class="score-card">
		<div class="score-card-header">
			<span class="score-icon">📸</span>
			<span class="score-title font-display">How to score</span>
		</div>
		<div class="score-rules">
			{#each scavengerRules as rule, i (i)}
				<div class="rule-row">
					<span class="rule-bullet">•</span>
					<span>{rule}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Scavenger checklist -->
	<div class="checklist-card">
		<div class="checklist-header">
			<h2 class="checklist-title font-display">Scavenger Hunt</h2>
			<button class="reset-btn" onclick={resetScavenger}>Reset</button>
		</div>

		<div class="tally">
			<div class="tally-row">
				<span class="tally-pct font-board">{pct}% collected</span>
				<span class="tally-pts font-display">
					{earned}<span class="tally-total font-board"> / {total} pts</span>
				</span>
			</div>
			<div class="progress-track">
				<div class="progress-bar" style="width: {pct}%"></div>
			</div>
		</div>

		<div class="checklist-items">
			{#each scavenger as item (item.id)}
				{@const checked = Object.hasOwn(controller.checks, item.id)}
				<label class="check-row" class:done={checked}>
					<input
						type="checkbox"
						checked={checked}
						onchange={() => controller.toggle(item.id)}
					/>
					<span class="check-box">
						<svg viewBox="0 0 24 24" fill="none" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M5 13l4 4L19 7" />
						</svg>
					</span>
					<span class="check-label">
						<span class="check-title" style="color: var(--ink)">{item.title}</span>
						{#if item.description}
							<span class="check-desc" style="color: var(--muted)">{item.description}</span>
						{/if}
					</span>
					<span class="check-pts font-board" style="color: {checked ? 'var(--good)' : 'var(--muted)'}">
						{item.points} pts
					</span>
				</label>
			{/each}
		</div>
	</div>
</div>

<style>
	.tasks-view {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.score-card {
		border-radius: 16px;
		overflow: hidden;
		background: var(--surface);
		border: 1px solid var(--line);
		box-shadow: 0 1px 2px var(--shadow);
	}

	.score-card-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		background: var(--board);
	}

	.score-icon {
		font-size: 15px;
	}

	.score-title {
		font-weight: 700;
		font-size: 15px;
		letter-spacing: 0.04em;
		color: var(--board-accent);
	}

	.score-rules {
		padding: 12px 16px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.rule-row {
		display: flex;
		gap: 8px;
		font-size: 13.5px;
		line-height: 1.5;
		color: var(--ink);
	}

	.rule-bullet {
		flex: 0 0 auto;
		font-weight: 700;
		color: var(--accent-ink);
	}

	.checklist-card {
		border-radius: 16px;
		overflow: hidden;
		background: var(--surface);
		border: 1px solid var(--line);
		box-shadow: 0 1px 2px var(--shadow);
	}

	.checklist-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 16px 8px;
	}

	.checklist-title {
		font-weight: 700;
		font-size: 19px;
		letter-spacing: 0.04em;
		color: var(--ink);
	}

	.reset-btn {
		font-size: 12px;
		font-weight: 600;
		padding: 4px 8px;
		border-radius: 6px;
		color: var(--muted);
		background: transparent;
		border: none;
		cursor: pointer;
	}

	.tally {
		padding: 0 16px 12px;
	}

	.tally-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 6px;
	}

	.tally-pct {
		font-size: 13px;
		color: var(--muted);
	}

	.tally-pts {
		font-weight: 700;
		font-size: 22px;
		color: var(--accent-ink);
	}

	.tally-total {
		font-size: 14px;
		color: var(--muted);
	}

	.progress-track {
		height: 10px;
		border-radius: 999px;
		overflow: hidden;
		background: var(--line);
	}

	.progress-bar {
		height: 100%;
		border-radius: 999px;
		background: var(--accent);
		transition: width 0.2s ease;
	}

	.checklist-items {
		border-top: 1px solid var(--line);
	}

	.check-row {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 12px 14px;
		cursor: pointer;
		user-select: none;
		border-bottom: 1px solid var(--line);
	}

	.check-row:last-child {
		border-bottom: none;
	}

	.check-label {
		flex: 1;
		min-width: 0;
	}

	.check-title {
		display: block;
		font-size: 15.5px;
		font-weight: 500;
		line-height: 1.3;
	}

	.check-desc {
		display: block;
		font-size: 13px;
		line-height: 1.3;
		margin-top: 2px;
	}

	.check-pts {
		font-size: 13px;
		font-weight: 600;
		flex: 0 0 auto;
		margin-top: 3px;
	}
</style>
