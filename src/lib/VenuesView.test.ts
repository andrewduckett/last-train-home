import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import VenuesView from './VenuesView.svelte';
import { crawl } from './crawl.js';

describe('VenuesView', () => {
	it('renders a directions link for every venue place', () => {
		render(VenuesView, { crawl: { id: 'cory-trent', title: crawl.appTitle, definition: crawl } });
		const links = screen.getAllByRole('link', { name: /directions/i });
		const totalPlaces = crawl.venues.reduce((sum, v) => sum + v.places.length, 0);
		expect(links).toHaveLength(totalPlaces);
	});

	it('each directions link href is a Google Maps search URL with name, address, town, and IL', () => {
		const { container } = render(VenuesView, { crawl: { id: 'cory-trent', title: crawl.appTitle, definition: crawl } });
		const allLinks = container.querySelectorAll('a[href*="google.com/maps/search"]');
		const hrefs = Array.from(allLinks).map((el) => el.getAttribute('href') ?? '');

		for (const venue of crawl.venues) {
			for (const place of venue.places) {
				const expected = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.n}, ${place.a}, ${venue.town}, IL`)}`;
				expect(hrefs, `Expected link for ${place.n} in ${venue.town}`).toContain(expected);
			}
		}
	});
});
