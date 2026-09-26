import { expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import Shell from './Shell.svelte';
import { createCrawlProvider } from './data/provider.js';

const base = { appTitle: 'Walk', line: 'A → B', schedule: [], places: [], scavenger: [], scavengerRules: [] };

function show(intro: unknown, links: unknown) {
	return render(Shell, { id: 'walk', getCrawl: createCrawlProvider(() => ({ title: 'Walk', definition: { ...base, intro, links } })).getCrawl });
}

it('shows Info for introduction alone', async () => {
	show('Welcome', []);
	await screen.findByTestId('view-schedule');
	expect(screen.getByRole('button', { name: /Info/ })).toBeInTheDocument();
	await fireEvent.click(screen.getByRole('button', { name: /Info/ }));
	expect(screen.getByTestId('view-info')).toHaveTextContent('Welcome');
});

it('shows Info for a valid link alone', async () => {
	show(undefined, [{ label: 'Tickets', url: 'https://example.com/tickets' }]);
	await screen.findByTestId('view-schedule');
	expect(screen.getByRole('button', { name: /Info/ })).toBeInTheDocument();
});

it.each([undefined, '', '   ', 42])('omits Info for unusable introduction %j', async (intro) => {
	show(intro, []);
	await screen.findByTestId('view-schedule');
	expect(screen.queryByRole('button', { name: /Info/ })).not.toBeInTheDocument();
});

it('omits Info for unsafe links', async () => {
	show(undefined, [{ label: 'Bad', url: 'javascript:alert(1)' }]);
	await screen.findByTestId('view-schedule');
	expect(screen.queryByRole('button', { name: /Info/ })).not.toBeInTheDocument();
});

it('keeps Schedule free of quick links', async () => {
	show(undefined, [{ label: 'Tickets', url: 'https://example.com/tickets' }]);
	const view = await screen.findByTestId('view-schedule');
	expect(view.querySelector('.quick-link')).toBeNull();
});
