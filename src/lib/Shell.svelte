<script lang="ts">
	import { onMount } from 'svelte';
	import { getCrawl as getDefaultCrawl, type CrawlProvider } from './data/provider.js';
	import type { CrawlResult } from './types.js';

	let { getCrawl = getDefaultCrawl }: { getCrawl?: CrawlProvider['getCrawl'] } = $props();
	let result = $state<CrawlResult>();

	onMount(() => {
		void getCrawl('cory-trent').then((resolved) => { result = resolved; });
	});
	import ScheduleView from './ScheduleView.svelte';
	import MapView from './MapView.svelte';
	import VenuesView from './VenuesView.svelte';
	import TasksView from './TasksView.svelte';

	const TABS = [
		{ id: 'schedule', label: 'Schedule', icon: '🕑' },
		{ id: 'map', label: 'Map', icon: '🗺️' },
		{ id: 'venues', label: 'Venues', icon: '🍺' },
		{ id: 'tasks', label: 'Tasks', icon: '✅' },
	] as const;

	type TabId = (typeof TABS)[number]['id'];

	const TITLES: Record<TabId, string> = {
		schedule: 'Schedule',
		map: 'Route Map',
		venues: 'Venues',
		tasks: 'Tasks',
	};

	let activeTab = $state<TabId>('schedule');

	function switchTab(id: TabId) {
		activeTab = id;
		window.scrollTo(0, 0);
	}
</script>

<div class="shell">
	{#if result?.status === 'found'}
	<header class="shell-header">
		<div class="header-inner" style="padding-top: max(12px, env(safe-area-inset-top))">
			<div class="header-title-row">
				<span class="header-icon">🚆</span>
				<h1 class="header-title font-display">{result.crawl.definition.appTitle}</h1>
			</div>
			<p class="header-line font-board">{result.crawl.definition.line}</p>
		</div>
	</header>
	{/if}

	<main class="shell-content">
		{#if !result}
			<p role="status">Loading crawl…</p>
		{:else if result.status === 'found'}
		<h2 class="view-title font-display">{TITLES[activeTab]}</h2>

		{#if activeTab === 'schedule'}
			<ScheduleView crawl={result.crawl} />
		{:else if activeTab === 'map'}
			<MapView crawl={result.crawl} />
		{:else if activeTab === 'venues'}
			<VenuesView crawl={result.crawl} />
		{:else if activeTab === 'tasks'}
			<TasksView crawl={result.crawl} />
		{/if}

		{:else if result.status === 'not-found'}
			<p role="status">Crawl not found.</p>
		{:else if result.status === 'invalid'}
			<p role="status">This crawl could not be displayed.</p>
		{:else if result.status === 'error'}
			<p role="status">Unable to load this crawl. Try again later.</p>
		{/if}

		<div class="content-spacer"></div>
	</main>

	<nav class="shell-nav safe-bottom">
		<div class="nav-grid">
			{#each TABS as tab (tab.id)}
				{@const active = activeTab === tab.id}
				<button
					class="nav-btn"
					class:nav-btn-active={active}
					aria-current={active ? 'page' : undefined}
					onclick={() => switchTab(tab.id)}
				>
					{#if active}<span class="nav-active-bar"></span>{/if}
					<span class="nav-icon" style="opacity: {active ? 1 : 0.55}">{tab.icon}</span>
					<span class="nav-label" style="color: {active ? '#F2A93B' : 'var(--board-muted)'}">
						{tab.label}
					</span>
				</button>
			{/each}
		</div>
	</nav>
</div>

<style>
	.shell {
		min-height: 100vh;
		max-width: 520px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
	}

	.shell-header {
		position: sticky;
		top: 0;
		z-index: 20;
		background: var(--board);
		border-bottom: 1px solid var(--board-line);
	}

	.header-inner {
		padding: 12px 16px 10px;
	}

	.header-title-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.header-icon {
		font-size: 19px;
	}

	.header-title {
		font-weight: 700;
		font-size: 21px;
		letter-spacing: 0.04em;
		color: var(--board-ink);
	}

	.header-line {
		font-size: 11.5px;
		margin-top: 2px;
		color: var(--board-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.shell-content {
		flex: 1;
		padding: 16px;
	}

	.view-title {
		font-weight: 600;
		font-size: 13px;
		text-transform: uppercase;
		letter-spacing: 0.18em;
		color: var(--muted);
		margin-bottom: 12px;
	}

	.content-spacer {
		height: 24px;
	}

	.shell-nav {
		position: sticky;
		bottom: 0;
		z-index: 20;
		background: var(--board);
		border-top: 1px solid var(--board-line);
	}

	.nav-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
	}

	.nav-btn {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 10px 4px;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: transform 0.1s;
	}

	.nav-btn:active {
		transform: scale(0.95);
	}

	.nav-active-bar {
		position: absolute;
		top: 0;
		height: 3px;
		width: 32px;
		border-radius: 999px;
		background: var(--accent);
	}

	.nav-icon {
		font-size: 19px;
		line-height: 1;
	}

	.nav-label {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.04em;
	}
</style>
