import { expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import Shell from './Shell.svelte';
import seed from '../../tests/fixtures/cory-trent.json';
import before from '../../tests/fixtures/cory-trent-before.json';
import { seedShellProps } from '../../tests/fixtures/seed-provider.js';

// The snapshot holds only the bars. The seed now writes the state into each
// town, which the app used to append.
const beforeBars = before.venues.flatMap((venue) =>
	venue.places.map((place) => ({
		stop: venue.stop,
		town: `${venue.town}, IL`,
		location: { name: place.n, address: place.a, label: 'Bar' },
	})),
);

// Find the bars by their authored label, so added stops and stations do not move them.
const seedBars = seed.places.flatMap((stop) =>
	stop.locations
		.filter((location) => location.label === 'Bar')
		.map((location) => ({ stop: stop.stop, town: stop.town, location })),
);

const beforeScavenger = before.scavenger.map((task) => ({
	id: task.id,
	title: task.t,
	points: task.p,
	description: task.d,
}));

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
	await openTab('info');
	expect(seed.links.map((link) => link.url)).toEqual([before.ventraUrl, before.metraUrl]);
	expect(screen.getByRole('link', { name: /Ventra/ })).toHaveAttribute('href', seed.links[0].url);
	expect(screen.getByRole('link', { name: /Metra/ })).toHaveAttribute('href', seed.links[1].url);
});

function barRows(container: HTMLElement) {
	return [...container.querySelectorAll('.location-row')].filter(
		(row) => row.querySelector('.location-label')?.textContent === 'Bar',
	) as HTMLElement[];
}

it('preserves all seed bars', async () => {
	expect(seedBars).toEqual(beforeBars);
	const { container } = await openTab('places');
	const cards = [...container.querySelectorAll('.stop-card')] as HTMLElement[];
	for (const bar of seedBars) {
		const card = cards.find((element) => within(element).queryByText(bar.stop));
		expect(card, `card for ${bar.stop}`).toBeDefined();
		expect(within(card!).getByText(bar.town)).toBeInTheDocument();
		expect(within(card!).getByText(bar.location.name)).toBeInTheDocument();
		expect(within(card!).getByText(bar.location.address)).toBeInTheDocument();
	}
});

it('shows the Meetup stop and each station before its bar', async () => {
	const { container } = await openTab('places');
	const cards = [...container.querySelectorAll('.stop-card')].map((card) => ({
		stop: card.querySelector('.stop-label')?.textContent,
		locations: [...card.querySelectorAll('.location-row')].map((row) => [
			row.querySelector('.location-name')?.textContent,
			row.querySelector('.location-address')?.textContent,
			row.querySelector('.location-label')?.textContent,
		]),
	}));
	expect(cards).toEqual([
		{ stop: 'Meetup', locations: [['Palatine Metra Station', '137 W Wood St', 'Train']] },
		{ stop: 'Stop 1', locations: [['Mount Prospect Metra Station', '13 E Northwest Hwy', 'Train'], ['Station 34', '34 S Main St', 'Bar']] },
		{ stop: 'Stop 2', locations: [['Edison Park Metra Station', '6730 N Olmsted Ave', 'Train'], ['Edison Park Inn', '6715 N Olmsted Ave', 'Bar']] },
		{ stop: 'Stop 3', locations: [['Arlington Heights Metra Station', '45 W Northwest Hwy', 'Train'], ["Eddie's", '10 E Northwest Hwy', 'Bar']] },
		{ stop: 'Stop 4', locations: [['Palatine Metra Station', '137 W Wood St', 'Train'], ['Tap House Grill', '56 W Wilson St', 'Bar']] },
	]);
});

it('preserves the seed bar directions destinations', async () => {
	const { container } = await openTab('places');
	const links = barRows(container).map((row) => within(row).getByRole('link', { name: 'Directions' }));
	expect(links.map((link) => decodeURIComponent(link.getAttribute('href')!))).toEqual([
		'https://www.google.com/maps/search/?api=1&query=Station 34, 34 S Main St, Mt. Prospect, IL',
		'https://www.google.com/maps/search/?api=1&query=Edison Park Inn, 6715 N Olmsted Ave, Edison Park, IL',
		"https://www.google.com/maps/search/?api=1&query=Eddie's, 10 E Northwest Hwy, Arlington Heights, IL",
		'https://www.google.com/maps/search/?api=1&query=Tap House Grill, 56 W Wilson St, Palatine, IL',
	]);
});

it('preserves every seed scavenger task', async () => {
	expect(seed.scavenger).toEqual(beforeScavenger);
	const { container } = await openTab('tasks');
	const rows = container.querySelectorAll('.check-row');
	expect(rows).toHaveLength(seed.scavenger.length);
	seed.scavenger.forEach((task, index) => {
		const row = within(rows[index] as HTMLElement);
		expect(row.getByText(task.title)).toBeInTheDocument();
		expect(row.getByText(task.description)).toBeInTheDocument();
		expect(row.getByText(`${task.points} pts`)).toBeInTheDocument();
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
