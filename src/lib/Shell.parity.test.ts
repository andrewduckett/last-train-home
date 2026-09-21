import { expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import Shell from './Shell.svelte';
import seed from '../../tests/fixtures/cory-trent.json';

async function openTab(tab: string) {
	const rendered = render(Shell);
	await screen.findByTestId('view-schedule');
	if (tab !== 'schedule') {
		await fireEvent.click(screen.getByRole('button', { name: new RegExp(tab, 'i') }));
	}
	return rendered;
}

it('preserves the seed header', async () => {
	await openTab('schedule');
	expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(seed.appTitle);
	expect(screen.getByText(seed.line)).toBeInTheDocument();
});

it('preserves every schedule entry in authored order', async () => {
	const { container } = await openTab('schedule');
	const entries = container.querySelectorAll('.timeline-entry');
	expect(entries).toHaveLength(seed.schedule.length);
	seed.schedule.forEach((entry, index) => {
		const row = within(entries[index] as HTMLElement);
		expect(row.getByText(entry.t)).toBeInTheDocument();
		expect(row.getByText(entry.title)).toBeInTheDocument();
		expect(row.getByText(entry.sub)).toBeInTheDocument();
		expect(entries[index].querySelector('.entry-tag')).toHaveTextContent(entry.tag);
	});
});

it('preserves the quick-link destinations', async () => {
	await openTab('schedule');
	expect(screen.getByRole('link', { name: /Ventra/ })).toHaveAttribute('href', seed.ventraUrl);
	expect(screen.getByRole('link', { name: /Metra/ })).toHaveAttribute('href', seed.metraUrl);
});

it('preserves all seed venues', async () => {
	const { container } = await openTab('venues');
	const cards = container.querySelectorAll('.venue-card');
	expect(cards).toHaveLength(seed.venues.length);
	seed.venues.forEach((venue, index) => {
		const card = within(cards[index] as HTMLElement);
		expect(card.getByText(venue.stop)).toBeInTheDocument();
		expect(card.getByText(venue.town)).toBeInTheDocument();
		for (const place of venue.places) {
			expect(card.getByText(place.n)).toBeInTheDocument();
			expect(card.getByText(place.a)).toBeInTheDocument();
		}
	});
});

it('preserves the seed directions destinations', async () => {
	await openTab('venues');
	const links = screen.getAllByRole('link', { name: 'Directions' });
	expect(links.map((link) => decodeURIComponent(link.getAttribute('href')!))).toEqual([
		'https://www.google.com/maps/search/?api=1&query=Station 34, 34 S Main St, Mt. Prospect, IL',
		'https://www.google.com/maps/search/?api=1&query=Edison Park Inn, 6715 N Olmsted Ave, Edison Park, IL',
		"https://www.google.com/maps/search/?api=1&query=Eddie's, 10 E Northwest Hwy, Arlington Heights, IL",
		'https://www.google.com/maps/search/?api=1&query=Tap House Grill, 56 W Wilson St, Palatine, IL',
	]);
});

it('preserves every seed scavenger task', async () => {
	const { container } = await openTab('tasks');
	const rows = container.querySelectorAll('.check-row');
	expect(rows).toHaveLength(seed.scavenger.length);
	seed.scavenger.forEach((task, index) => {
		const row = within(rows[index] as HTMLElement);
		expect(row.getByText(task.t)).toBeInTheDocument();
		expect(row.getByText(task.d)).toBeInTheDocument();
		expect(row.getByText(`${task.p} pts`)).toBeInTheDocument();
	});
});

it('preserves the scavenger rules', async () => {
	await openTab('tasks');
	for (const rule of seed.scavengerRules) {
		expect(screen.getByText(rule)).toBeInTheDocument();
	}
});

it('hides the seed placeholder album link', async () => {
	await openTab('tasks');
	expect(screen.queryByRole('link', { name: /Open group album/ })).not.toBeInTheDocument();
});

it('preserves the seed map destinations', async () => {
	await openTab('map');
	expect(screen.getByTitle('Crawl route map')).toHaveAttribute('src', seed.myMapsEmbedUrl);
	expect(screen.getByTestId('map-viewer-link')).toHaveAttribute('href', seed.myMapsAppUrl);
});
