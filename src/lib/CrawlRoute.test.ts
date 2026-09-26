import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { expect, it } from 'vitest';
import { createCrawlProvider, createYamlCrawlProvider } from './data/provider.js';
import type { CrawlResult } from './types.js';
import CrawlRoute from './CrawlRoute.svelte';

function record(title: string) {
	return {
		title,
		definition: {
			appTitle: title,
			line: 'A → B',
			schedule: [],
			places: [],
			scavenger: [],
			scavengerRules: [],
			links: [],
		},
	};
}

it('resolves the id selected by a direct route', async () => {
	const ids: string[] = [];
	const provider = createCrawlProvider(() => record('Direct route'));
	render(CrawlRoute, {
		id: 'direct-link',
		getCrawl: (id) => {
			ids.push(id);
			return provider.getCrawl(id);
		},
	});
	await screen.findByRole('heading', { name: 'Direct route' });
	expect(ids).toEqual(['direct-link']);
});

it('loads a new crawl after an in-session id change', async () => {
	const ids: string[] = [];
	const provider = createCrawlProvider((id) => record(id === 'first' ? 'First crawl' : 'Second crawl'));
	const getCrawl = (id: string) => {
		ids.push(id);
		return provider.getCrawl(id);
	};
	const rendered = render(CrawlRoute, { id: 'first', getCrawl });
	await screen.findByRole('heading', { name: 'First crawl' });
	await rendered.rerender({ id: 'second', getCrawl });
	await screen.findByRole('heading', { name: 'Second crawl' });
	expect(ids).toEqual(['first', 'second']);
});

it('resets Info to Schedule when the new crawl has no Info content', async () => {
	const provider = createCrawlProvider((id) => {
		const crawl = record(id);
		return { ...crawl, definition: { ...crawl.definition, ...(id === 'first' ? { intro: 'Welcome' } : {}) } };
	});
	const rendered = render(CrawlRoute, { id: 'first', getCrawl: provider.getCrawl });
	await screen.findByTestId('view-schedule');
	await fireEvent.click(screen.getByRole('button', { name: /Info/ }));
	expect(screen.getByTestId('view-info')).toBeInTheDocument();
	await rendered.rerender({ id: 'second', getCrawl: provider.getCrawl });
	await screen.findByRole('heading', { name: 'second' });
	expect(screen.getByTestId('view-schedule')).toBeInTheDocument();
	expect(screen.getByRole('button', { name: /Schedule/ })).toHaveAttribute('aria-current', 'page');
	expect(screen.queryByRole('button', { name: /Info/ })).not.toBeInTheDocument();
});

it('keeps the newest crawl when an earlier request resolves last', async () => {
	const releases = new Map<string, (result: CrawlResult) => void>();
	const getCrawl = (id: string) =>
		new Promise<CrawlResult>((resolve) => {
			releases.set(id, resolve);
		});
	const rendered = render(CrawlRoute, { id: 'first', getCrawl });
	await rendered.rerender({ id: 'second', getCrawl });
	releases.get('second')?.({ status: 'found', crawl: { id: 'second', ...record('Second crawl') } });
	await screen.findByRole('heading', { name: 'Second crawl' });
	releases.get('first')?.({ status: 'found', crawl: { id: 'first', ...record('First crawl') } });
	await Promise.resolve();
	expect(screen.getByRole('heading', { name: 'Second crawl' })).toBeInTheDocument();
	expect(screen.queryByRole('heading', { name: 'First crawl' })).not.toBeInTheDocument();
});

it.each([
	['unknown-crawl', 1],
	['bad_id', 0],
	['Mixed-Case', 0],
] as const)('shows not-found for direct id %j', async (id, expectedRequests) => {
	let requests = 0;
	const provider = createYamlCrawlProvider(async () => {
		requests += 1;
		return {
			ok: false,
			status: 404,
			headers: { get: () => 'text/html' },
			text: async () => '',
		};
	});
	render(CrawlRoute, { id, getCrawl: provider.getCrawl });
	await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Crawl not found.'));
	expect(screen.queryByTestId('view-schedule')).not.toBeInTheDocument();
	expect(requests).toBe(expectedRequests);
});
