import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import Shell from './Shell.svelte';
import CrawlRoute from './CrawlRoute.svelte';
import { defaultCrawl } from './config.js';
import { createCrawlProvider } from './data/provider.js';
import { crawl as seed } from '../../tests/fixtures/cory-trent.js';

beforeEach(() => {
	localStorage.clear();
	vi.restoreAllMocks();
});

const getCrawl = createCrawlProvider(() => ({ title: 'Test crawl', definition: seed })).getCrawl;

async function openTasks() {
	await screen.findByTestId('view-schedule');
	await fireEvent.click(screen.getByRole('button', { name: /Tasks/ }));
	await screen.findByTestId('view-tasks');
}

function firstCheck() {
	return screen.getAllByRole('checkbox')[0] as HTMLInputElement;
}

it('ignores the old global key', async () => {
	localStorage.setItem('crawl-checks-v1', '{"sh-selfie":true}');
	render(Shell, { id: 'first', getCrawl });
	await openTasks();
	expect(firstCheck()).not.toBeChecked();
});

it('restores a check after the shell remounts', async () => {
	const first = render(Shell, { id: 'first', getCrawl });
	await openTasks();
	await fireEvent.click(firstCheck());
	first.unmount();
	render(Shell, { id: 'first', getCrawl });
	await openTasks();
	expect(firstCheck()).toBeChecked();
	expect(screen.getByText(/12% collected/)).toBeInTheDocument();
});

it('stores checks separately for crawls sharing task ids', async () => {
	const first = render(CrawlRoute, { id: 'first', getCrawl });
	await openTasks();
	await fireEvent.click(firstCheck());
	await first.rerender({ id: 'second', getCrawl });
	await openTasks();
	expect(firstCheck()).not.toBeChecked();
	await fireEvent.click(firstCheck());
	expect(localStorage.getItem('crawl-checks:first')).toContain('sh-selfie');
	expect(localStorage.getItem('crawl-checks:second')).toContain('sh-selfie');
});

it('shares saved checks across root and id routes for one crawl', async () => {
	const root = render(Shell, { id: defaultCrawl, getCrawl });
	await openTasks();
	await fireEvent.click(firstCheck());
	root.unmount();
	render(CrawlRoute, { id: defaultCrawl, getCrawl });
	await openTasks();
	expect(firstCheck()).toBeChecked();
});

it('reads newer saved checks when Tasks opens', async () => {
	render(Shell, { id: 'first', getCrawl });
	await screen.findByTestId('view-schedule');
	localStorage.setItem('crawl-checks:first', '{"sh-selfie":true}');
	await fireEvent.click(screen.getByRole('button', { name: /Tasks/ }));
	expect(firstCheck()).toBeChecked();
});

it('starts with no checks when storage is malformed', async () => {
	localStorage.setItem('crawl-checks:first', 'bad json');
	render(Shell, { id: 'first', getCrawl });
	await openTasks();
	expect(firstCheck()).not.toBeChecked();
	await fireEvent.click(firstCheck());
	expect(firstCheck()).toBeChecked();
});

it('keeps the checklist usable when storage reads throw', async () => {
	vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
	render(Shell, { id: 'first', getCrawl });
	await openTasks();
	expect(firstCheck()).not.toBeChecked();
	await fireEvent.click(firstCheck());
	expect(firstCheck()).toBeChecked();
});

it('does not count removed task ids', async () => {
	localStorage.setItem('crawl-checks:first', '{"removed":true}');
	render(Shell, { id: 'first', getCrawl });
	await openTasks();
	expect(screen.getByText(/0% collected/)).toBeInTheDocument();
	await fireEvent.click(firstCheck());
	expect(localStorage.getItem('crawl-checks:first')).not.toContain('removed');
});

it('keeps a failed write across tab changes', async () => {
	vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full'); });
	render(Shell, { id: 'first', getCrawl });
	await openTasks();
	await fireEvent.click(firstCheck());
	await fireEvent.click(screen.getByRole('button', { name: /Schedule/ }));
	await openTasks();
	expect(firstCheck()).toBeChecked();
	expect(screen.getByText(/12% collected/)).toBeInTheDocument();
});

it('resets unsaved checks after confirmation', async () => {
	vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full'); });
	vi.spyOn(window, 'confirm').mockReturnValue(true);
	render(Shell, { id: 'first', getCrawl });
	await openTasks();
	await fireEvent.click(firstCheck());
	await fireEvent.click(screen.getByRole('button', { name: /Reset/ }));
	await fireEvent.click(screen.getByRole('button', { name: /Schedule/ }));
	await openTasks();
	expect(firstCheck()).not.toBeChecked();
	expect(screen.getByText(/0% collected/)).toBeInTheDocument();
});
