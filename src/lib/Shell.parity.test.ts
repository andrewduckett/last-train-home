import { expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import Shell from './Shell.svelte';
import seed from '../../tests/fixtures/cory-trent.json';
import before from '../../tests/fixtures/cory-trent-before.json';
import { seedShellProps } from '../../tests/fixtures/seed-provider.js';

async function openTab(tab: string) {
	const rendered = render(Shell, seedShellProps);
	await screen.findByTestId('view-schedule');
	if (tab !== 'schedule') {
		await fireEvent.click(screen.getByRole('button', { name: new RegExp(tab, 'i') }));
	}
	return rendered;
}

it('preserves the seed header', async () => {
	await openTab('schedule');
	expect(seed.appTitle).toBe(before.appTitle);
	expect(seed.line).toBe(before.line);
	expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(seed.appTitle);
	expect(screen.getByText(seed.line)).toBeInTheDocument();
});

it('preserves every schedule entry in authored order', async () => {
	const { container } = await openTab('schedule');
	const entries = container.querySelectorAll('.timeline-entry');
	expect(entries).toHaveLength(seed.schedule.length);
	seed.schedule.forEach((entry, index) => {
		const row = within(entries[index] as HTMLElement);
		expect(entry.time).toBe(before.schedule[index].t);
		expect(entry.title).toBe(before.schedule[index].title);
		expect(row.getByText(entry.time)).toBeInTheDocument();
		expect(row.getByText(entry.title)).toBeInTheDocument();
		expect(row.getByText(entry.mode ?? entry.note)).toHaveTextContent(before.schedule[index].sub);
		expect(entries[index].querySelector('.entry-tag')).toHaveTextContent(entry.tag);
	});
});

it('preserves the quick-link destinations', async () => {
	await openTab('schedule');
	expect(seed.links.map((link) => link.url)).toEqual([before.ventraUrl, before.metraUrl]);
	expect(screen.getByRole('link', { name: /Ventra/ })).toHaveAttribute('href', seed.links[0].url);
	expect(screen.getByRole('link', { name: /Metra/ })).toHaveAttribute('href', seed.links[1].url);
});

it('preserves all seed venues', async () => {
	expect(seed.venues).toEqual(before.venues);
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
	expect(seed.scavenger).toEqual(before.scavenger);
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
	expect(seed.scavengerRules).toEqual(before.scavengerRules);
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
	expect(seed.map).toEqual({ embed: before.myMapsEmbedUrl, app: before.myMapsAppUrl });
	expect(screen.getByTitle('Crawl route map')).toHaveAttribute('src', seed.map.embed);
	expect(screen.getByTestId('map-viewer-link')).toHaveAttribute('href', seed.map.app);
});
