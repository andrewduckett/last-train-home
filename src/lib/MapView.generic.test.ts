import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import MapView from './MapView.svelte';
import type { Crawl } from './types.js';

function show(map: unknown) {
	return render(MapView, { crawl: { id: 'walk', title: 'Walk', definition: { map } } as Crawl });
}

it('renders the configured embed and viewer URLs', () => {
	show({ embed: 'https://www.google.com/maps/d/embed?mid=x', app: 'https://www.google.com/maps/d/viewer?mid=x' });
	expect(screen.getByTitle('Crawl route map')).toHaveAttribute('src', 'https://www.google.com/maps/d/embed?mid=x');
	expect(screen.getByTestId('map-viewer-link')).toHaveAttribute('href', 'https://www.google.com/maps/d/viewer?mid=x');
});

it.each([undefined, null, { embed: 'javascript:alert(1)', app: 'https://www.google.com/maps/d/viewer' }, { embed: 'https://www.google.com/maps/embed', app: 'https://evil.example/maps/d/viewer' }])('shows an unavailable message for an invalid map', (map) => {
	show(map);
	expect(screen.getByText(/map unavailable/i)).toBeInTheDocument();
	expect(screen.queryByTitle('Crawl route map')).not.toBeInTheDocument();
	expect(screen.queryByTestId('map-viewer-link')).not.toBeInTheDocument();
});
