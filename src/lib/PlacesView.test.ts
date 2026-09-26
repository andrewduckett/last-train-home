import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/svelte';
import PlacesView from './PlacesView.svelte';
import { crawl } from '../../tests/fixtures/cory-trent.js';
import type { PlaceStop } from './types.js';

const iPhone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1';

function renderPlaces(places: PlaceStop[] = crawl.places) {
	return render(PlacesView, { crawl: { id: 'cory-trent', title: crawl.appTitle, definition: { ...crawl, places } } });
}

function authoredQueries(places: PlaceStop[] = crawl.places) {
	return places.flatMap((stop) =>
		stop.locations.map((location) => encodeURIComponent(`${location.name}, ${location.address}, ${stop.town}`)),
	);
}

const riverStop: PlaceStop = {
	stop: 'Stop 1',
	town: 'River Town',
	locations: [
		{ name: 'River Landing', address: '1 Dock St', label: 'Ferry' },
		{ name: 'Canal Cafe', address: '7 River Rd' },
	],
};

afterEach(() => {
	vi.restoreAllMocks();
});

describe('PlacesView', () => {
	it('renders a directions link for every location', () => {
		renderPlaces();
		const links = screen.getAllByRole('link', { name: 'Directions' });
		expect(links).toHaveLength(crawl.places.reduce((sum, stop) => sum + stop.locations.length, 0));
	});

	it('shows a location label as a tag beside its name', () => {
		const { container } = renderPlaces([riverStop]);
		const row = container.querySelectorAll('.location-row')[0] as HTMLElement;
		expect(within(row).getByText('Ferry')).toHaveClass('location-label');
	});

	it('shows no tag for a location without a label', () => {
		const { container } = renderPlaces([riverStop]);
		const row = container.querySelectorAll('.location-row')[1] as HTMLElement;
		expect(within(row).getByText('Canal Cafe')).toBeInTheDocument();
		expect(row.querySelector('.location-label')).toBeNull();
	});

	it('lists the locations at one stop in authored order with no OR divider', () => {
		const { container } = renderPlaces([riverStop]);
		const names = [...container.querySelectorAll('.location-name')].map((element) => element.textContent);
		expect(names).toEqual(['River Landing', 'Canal Cafe']);
		expect(screen.queryByText('OR')).not.toBeInTheDocument();
	});

	it('renders a stop that holds a single location', () => {
		const meetup = crawl.places[0];
		const { container } = renderPlaces([meetup]);
		const card = within(container.querySelector('.stop-card') as HTMLElement);
		expect(card.getByText(meetup.stop)).toBeInTheDocument();
		expect(card.getByText(meetup.locations[0].name)).toBeInTheDocument();
		expect(card.getAllByRole('link', { name: 'Directions' })).toHaveLength(1);
	});

	it("builds each query from the location's name and address and its stop's town", () => {
		renderPlaces([riverStop]);
		const links = screen.getAllByRole('link', { name: 'Directions' });
		expect(links.map((link) => new URL(link.getAttribute('href')!).searchParams.get('query'))).toEqual([
			'River Landing, 1 Dock St, River Town',
			'Canal Cafe, 7 River Rd, River Town',
		]);
	});

	it('links a non-Apple device to Google Maps searches in a new tab', () => {
		renderPlaces();
		const links = screen.getAllByRole('link', { name: 'Directions' });
		expect(links.map((link) => link.getAttribute('href'))).toEqual(
			authoredQueries().map((query) => `https://www.google.com/maps/search/?api=1&query=${query}`),
		);
		for (const link of links) {
			expect(link).toHaveAttribute('target', '_blank');
			expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		}
	});

	it('links an iPhone to Apple Maps searches in the same tab', () => {
		vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(iPhone);
		renderPlaces();
		const links = screen.getAllByRole('link', { name: 'Directions' });
		expect(links.map((link) => link.getAttribute('href'))).toEqual(
			authoredQueries().map((query) => `https://maps.apple.com/?q=${query}`),
		);
		for (const link of links) {
			expect(link).not.toHaveAttribute('target');
			expect(link).not.toHaveAttribute('rel');
		}
	});

	it('keeps authored punctuation inside the query parameter', () => {
		renderPlaces([{ stop: 'Stop 1', town: 'River Town', locations: [{ name: 'Pub & Grill #2?', address: '1 Main St' }] }]);
		const url = new URL(screen.getByRole('link', { name: 'Directions' }).getAttribute('href')!);
		expect(url.searchParams.get('query')).toBe('Pub & Grill #2?, 1 Main St, River Town');
		expect([...url.searchParams.keys()]).toEqual(['api', 'query']);
		expect(url.hash).toBe('');
	});
});
