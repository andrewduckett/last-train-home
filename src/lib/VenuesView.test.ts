import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import VenuesView from './VenuesView.svelte';
import { crawl } from '../../tests/fixtures/cory-trent.js';

const iPhone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1';

function renderSeed() {
	return render(VenuesView, { crawl: { id: 'cory-trent', title: crawl.appTitle, definition: crawl } });
}

function authoredQueries() {
	return crawl.venues.flatMap((venue) =>
		venue.places.map((place) => encodeURIComponent(`${place.name}, ${place.address}, ${venue.town}`)),
	);
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('VenuesView', () => {
	it('renders a directions link for every venue place', () => {
		renderSeed();
		const links = screen.getAllByRole('link', { name: /directions/i });
		const totalPlaces = crawl.venues.reduce((sum, v) => sum + v.places.length, 0);
		expect(links).toHaveLength(totalPlaces);
	});

	it('links a non-Apple device to Google Maps searches for the authored text in a new tab', () => {
		renderSeed();
		const links = screen.getAllByRole('link', { name: 'Directions' });
		expect(links.map((link) => link.getAttribute('href'))).toEqual(
			authoredQueries().map((query) => `https://www.google.com/maps/search/?api=1&query=${query}`),
		);
		for (const link of links) {
			expect(link).toHaveAttribute('target', '_blank');
			expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		}
	});

	it('links an iPhone to Apple Maps searches for the authored text in the same tab', () => {
		vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(iPhone);
		renderSeed();
		const links = screen.getAllByRole('link', { name: 'Directions' });
		expect(links.map((link) => link.getAttribute('href'))).toEqual(
			authoredQueries().map((query) => `https://maps.apple.com/?q=${query}`),
		);
		for (const link of links) {
			expect(link).not.toHaveAttribute('target');
			expect(link).not.toHaveAttribute('rel');
		}
	});
});
