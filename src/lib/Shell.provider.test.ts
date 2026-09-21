import { expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import Shell from './Shell.svelte';
import { createCrawlProvider } from './data/provider.js';
import type { CrawlDefinition } from './types.js';

const definition: CrawlDefinition = {
	appTitle: 'River Walk', line: 'Library → Riverside',
	schedule: [{ t: '1:00 PM', kind: 'stop', tag: 'Meet', title: 'Library steps', sub: 'Bring a camera' }],
	venues: [{ stop: 'First', town: 'River Town', places: [{ n: 'Canal Cafe', a: '7 River Rd' }] }],
	scavenger: [{ id: 'river-photo', t: 'Find a heron', p: 30, d: 'Photograph it from the path' }],
	scavengerRules: ['Share a bird photo.'],
	myMapsEmbedUrl: 'https://www.google.com/maps/d/embed?mid=river',
	myMapsAppUrl: 'https://www.google.com/maps/d/viewer?mid=river',
	ventraUrl: 'https://example.com/passes', metraUrl: 'https://example.com/times',
	albumUrl: 'https://example.com/river-photos',
};

const source = { title: 'Identity title is different', definition };

function renderRiverWalk() {
	return render(Shell, { getCrawl: createCrawlProvider(() => source).getCrawl });
}

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
	expect(screen.getByRole('link', { name: /Ventra/ })).toHaveAttribute('href', definition.ventraUrl);
	expect(screen.getByRole('link', { name: /Metra/ })).toHaveAttribute('href', definition.metraUrl);
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
	expect(screen.getByTitle('Crawl route map')).toHaveAttribute('src', definition.myMapsEmbedUrl);
	expect(screen.getByTestId('map-viewer-link')).toHaveAttribute('href', definition.myMapsAppUrl);
});
