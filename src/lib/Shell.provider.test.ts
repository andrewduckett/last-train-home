import { expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import Shell from './Shell.svelte';
import { createCrawlProvider } from './data/provider.js';
import type { CrawlDefinition } from './types.js';

const definition: CrawlDefinition = {
	appTitle: 'River Walk', line: 'Library → Riverside',
	schedule: [{ time: '1:00 PM', kind: 'stop', tag: 'Meet', title: 'Library steps', note: 'Bring a camera' }],
	venues: [{ stop: 'First', town: 'River Town', places: [{ n: 'Canal Cafe', a: '7 River Rd' }] }],
	scavenger: [{ id: 'river-photo', t: 'Find a heron', p: 30, d: 'Photograph it from the path' }],
	scavengerRules: ['Share a bird photo.'],
	map: { embed: 'https://www.google.com/maps/d/embed?mid=river', app: 'https://www.google.com/maps/d/viewer?mid=river' },
	links: [{ label: 'Tickets', url: 'https://example.com/passes' }, { label: 'Times', url: 'https://example.com/times' }],
	albumUrl: 'https://example.com/river-photos',
};

const source = { title: 'Identity title is different', definition };

function renderRiverWalk() {
	return render(Shell, { id: 'river-walk', getCrawl: createCrawlProvider(() => source).getCrawl });
}

it('resolves the selected id once per mount', async () => {
	const calls: string[] = [];
	const provider = createCrawlProvider(() => source);
	render(Shell, {
		id: 'river-walk',
		getCrawl: (id) => {
			calls.push(id);
			return provider.getCrawl(id);
		},
	});
	await screen.findByTestId('view-schedule');
	expect(calls).toEqual(['river-walk']);
});

it('renders the resolved definition header', async () => {
	renderRiverWalk();
	expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('River Walk');
	expect(screen.getByText('Library → Riverside')).toBeInTheDocument();
	expect(screen.queryByText(source.title)).not.toBeInTheDocument();
});

it('renders the resolved schedule', async () => {
	renderRiverWalk();
	const view = await screen.findByTestId('view-schedule');
	expect(view).toHaveTextContent('Library steps');
	expect(screen.getByRole('link', { name: /Tickets/ })).toHaveAttribute('href', definition.links[0].url);
	expect(screen.getByRole('link', { name: /Times/ })).toHaveAttribute('href', definition.links[1].url);
});

it('renders the resolved venues', async () => {
	renderRiverWalk();
	await screen.findByTestId('view-schedule');
	await fireEvent.click(screen.getByRole('button', { name: /Venues/ }));
	expect(screen.getByTestId('view-venues')).toHaveTextContent('Canal Cafe');
	expect(screen.getByText('7 River Rd')).toBeInTheDocument();
	expect(screen.getByRole('link', { name: 'Directions' })).toHaveAttribute(
		'href', 'https://www.google.com/maps/search/?api=1&query=Canal%20Cafe%2C%207%20River%20Rd%2C%20River%20Town%2C%20IL',
	);
});

it('renders the resolved scavenger checklist', async () => {
	renderRiverWalk();
	await screen.findByTestId('view-schedule');
	await fireEvent.click(screen.getByRole('button', { name: /Tasks/ }));
	expect(screen.getByRole('checkbox', { name: /Find a heron/ })).toBeInTheDocument();
	expect(screen.getByText('30 pts')).toBeInTheDocument();
	expect(screen.getByText('Share a bird photo.')).toBeInTheDocument();
	expect(screen.getByRole('link', { name: /Open group album/ })).toHaveAttribute('href', definition.albumUrl);
});

it('renders the resolved map', async () => {
	renderRiverWalk();
	await screen.findByTestId('view-schedule');
	await fireEvent.click(screen.getByRole('button', { name: /Map/ }));
	expect(screen.getByTitle('Crawl route map')).toHaveAttribute('src', definition.map.embed);
	expect(screen.getByTestId('map-viewer-link')).toHaveAttribute('href', definition.map.app);
});

it('keeps venues and tasks usable when itinerary fields are malformed', async () => {
	const malformed = { ...definition, schedule: null, links: 'invalid', map: { embed: 'javascript:alert(1)', app: 'https://www.google.com/maps/d/viewer' } };
	render(Shell, { id: 'river-walk', getCrawl: createCrawlProvider(() => ({ title: 'River Walk', definition: malformed })).getCrawl });
	expect(await screen.findByTestId('view-schedule')).toHaveTextContent('Schedule unavailable.');
	expect(screen.queryByRole('link', { name: 'Tickets' })).not.toBeInTheDocument();
	await fireEvent.click(screen.getByRole('button', { name: /Map/ }));
	expect(screen.getByTestId('view-map')).toHaveTextContent('Map unavailable.');
	expect(screen.queryByTitle('Crawl route map')).not.toBeInTheDocument();
	await fireEvent.click(screen.getByRole('button', { name: /Venues/ }));
	expect(screen.getByTestId('view-venues')).toHaveTextContent('Canal Cafe');
	await fireEvent.click(screen.getByRole('button', { name: /Tasks/ }));
	expect(screen.getByRole('checkbox', { name: /Find a heron/ })).toBeInTheDocument();
});

it('shows a loading state until the provider resolves', async () => {
	let release!: () => void;
	const pending = new Promise<void>((resolve) => { release = resolve; });
	const provider = createCrawlProvider(() => source);
	render(Shell, { id: 'river-walk', getCrawl: async (id) => { await pending; return provider.getCrawl(id); } });
	expect(screen.getByRole('status')).toHaveTextContent('Loading crawl…');
	expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
	for (const tab of ['schedule', 'map', 'venues', 'tasks']) {
		expect(screen.queryByTestId(`view-${tab}`)).not.toBeInTheDocument();
	}
	release();
	expect(await screen.findByTestId('view-schedule')).toHaveTextContent('Library steps');
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it.each([
	['not-found', (): unknown => undefined, 'Crawl not found.'],
	['invalid', (): unknown => ({ title: null }), 'This crawl could not be displayed.'],
	['error', (): unknown => { throw new Error('private diagnostic'); }, 'Unable to load this crawl. Try again later.'],
] as const)('shows a fallback for %s', async (_status, retrieve, message) => {
	render(Shell, { id: 'river-walk', getCrawl: createCrawlProvider(retrieve).getCrawl });
	await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(message));
	expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
	for (const tab of ['schedule', 'map', 'venues', 'tasks']) {
		await fireEvent.click(screen.getByRole('button', { name: new RegExp(tab, 'i') }));
		for (const view of ['schedule', 'map', 'venues', 'tasks']) {
			expect(screen.queryByTestId(`view-${view}`)).not.toBeInTheDocument();
		}
	}
});

it('reuses one resolved crawl across tab switches', async () => {
	const calls: string[] = [];
	const provider = createCrawlProvider(() => source);
	render(Shell, { id: 'river-walk', getCrawl: (id) => { calls.push(id); return provider.getCrawl(id); } });
	await screen.findByTestId('view-schedule');
	for (const tab of ['venues', 'tasks', 'map', 'schedule']) {
		await fireEvent.click(screen.getByRole('button', { name: new RegExp(tab, 'i') }));
		expect(screen.getByTestId(`view-${tab}`)).toBeInTheDocument();
	}
	expect(calls).toEqual(['river-walk']);
	expect(screen.getByText('Library steps')).toBeInTheDocument();
});
