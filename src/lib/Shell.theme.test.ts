import { afterEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CrawlRoute from './CrawlRoute.svelte';
import { createCrawlProvider } from './data/provider.js';
import type { CrawlResult } from './types.js';

const definition = {
	appTitle: 'A crawl', line: 'A → B', schedule: [], venues: [], scavenger: [],
	scavengerRules: [], map: { embed: '', app: '' }, links: [], albumUrl: '',
};
const record = (color?: string) => ({ title: 'A crawl', color, definition });

afterEach(() => vi.restoreAllMocks());

it.each([
	['amber', 'amber'], ['teal', 'teal'], [undefined, 'neutral'],
	['unknown', 'neutral'], ['Amber', 'neutral'],
])('selects %s as %s and keeps the crawl usable', async (color, expected) => {
	const provider = createCrawlProvider(() => color === undefined ? { title: 'A crawl', definition } : record(color));
	const rendered = render(CrawlRoute, { id: 'first', getCrawl: provider.getCrawl });
	await screen.findByTestId('view-schedule');
	expect(rendered.container.querySelector('.shell')).toHaveAttribute('data-palette', expected);
});

it('replaces the palette when the crawl route changes', async () => {
	const provider = createCrawlProvider((id) => record(id === 'first' ? 'amber' : 'teal'));
	const rendered = render(CrawlRoute, { id: 'first', getCrawl: provider.getCrawl });
	await screen.findByTestId('view-schedule');
	expect(rendered.container.querySelector('.shell')).toHaveAttribute('data-palette', 'amber');
	await rendered.rerender({ id: 'second', getCrawl: provider.getCrawl });
	await screen.findByTestId('view-schedule');
	expect(rendered.container.querySelector('.shell')).toHaveAttribute('data-palette', 'teal');
});

it('ignores a late result after unmount before reading checklist storage', async () => {
	const releases = new Map<string, (result: CrawlResult) => void>();
	const getCrawl = (id: string) => new Promise<CrawlResult>((resolve) => { releases.set(id, resolve); });
	const read = vi.spyOn(Storage.prototype, 'getItem');
	const rendered = render(CrawlRoute, { id: 'first', getCrawl });
	await rendered.rerender({ id: 'second', getCrawl });
	releases.get('first')?.({ status: 'found', crawl: { id: 'first', ...record('amber') } });
	await Promise.resolve();
	expect(read).not.toHaveBeenCalled();
	expect(rendered.container.querySelector('.shell')).toHaveAttribute('data-palette', 'neutral');
});
