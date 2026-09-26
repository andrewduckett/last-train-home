import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import Shell from './Shell.svelte';
import CrawlRoute from './CrawlRoute.svelte';
import { defaultCrawl } from './config.js';
import { createCrawlProvider } from './data/provider.js';
import { buildRecord, task } from '../../tests/fixtures/crawl-builders.js';

beforeEach(() => {
	localStorage.clear();
	vi.restoreAllMocks();
});

// Points total 100, so one check on the first task shows 10% collected.
const tasks = [
	task({ id: 'first-task', title: 'First Task', points: 10 }),
	task({ id: 'second-task', title: 'Second Task', points: 40 }),
	task({ id: 'third-task', title: 'Third Task', points: 50 }),
];
const getCrawl = createCrawlProvider(() => buildRecord({ definition: { scavenger: tasks } })).getCrawl;

async function openTasks() {
	await screen.findByTestId('view-schedule');
	await fireEvent.click(screen.getByRole('button', { name: /Tasks/ }));
	await screen.findByTestId('view-tasks');
}

function firstCheck() {
	return screen.getAllByRole('checkbox')[0] as HTMLInputElement;
}

it('keeps saved checks by task id after an author retitles the tasks', async () => {
	localStorage.setItem('crawl-checks:first', '{"first-task":true,"third-task":true}');
	const retitled = tasks.map((item) => ({ ...item, title: `Renamed ${item.title}` }));
	render(Shell, { id: 'first', getCrawl: createCrawlProvider(() => buildRecord({ definition: { scavenger: retitled } })).getCrawl });
	await openTasks();
	const checked = screen.getAllByRole('checkbox').filter((box) => (box as HTMLInputElement).checked);
	expect(checked.map((box) => box.closest('label')?.querySelector('.check-title')?.textContent)).toEqual([
		'Renamed First Task',
		'Renamed Third Task',
	]);
	expect(document.querySelector('.tally-pts')).toHaveTextContent(/^60\s*\/\s*100 pts$/);
});

it('ignores the old global key', async () => {
	localStorage.setItem('crawl-checks-v1', '{"first-task":true}');
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
	expect(screen.getByText(/10% collected/)).toBeInTheDocument();
});

it('stores checks separately for crawls sharing task ids', async () => {
	const first = render(CrawlRoute, { id: 'first', getCrawl });
	await openTasks();
	await fireEvent.click(firstCheck());
	await first.rerender({ id: 'second', getCrawl });
	await openTasks();
	expect(firstCheck()).not.toBeChecked();
	await fireEvent.click(firstCheck());
	expect(localStorage.getItem('crawl-checks:first')).toContain('first-task');
	expect(localStorage.getItem('crawl-checks:second')).toContain('first-task');
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
	localStorage.setItem('crawl-checks:first', '{"first-task":true}');
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
	expect(screen.getByText(/10% collected/)).toBeInTheDocument();
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
