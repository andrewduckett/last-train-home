import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import MapView from './MapView.svelte';
import { crawl } from '../../tests/fixtures/cory-trent.js';

describe('MapView', () => {
	it('renders an embedded map iframe', () => {
		render(MapView, { crawl: { id: 'cory-trent', title: crawl.appTitle, definition: crawl } });
		const iframe = document.querySelector('iframe[title="Crawl route map"]');
		expect(iframe).toBeTruthy();
	});

	it('viewer link opens to the configured myMapsAppUrl', () => {
		render(MapView, { crawl: { id: 'cory-trent', title: crawl.appTitle, definition: crawl } });
		const link = screen.getByTestId('map-viewer-link');
		expect(link).toHaveAttribute('href', crawl.myMapsAppUrl);
		expect(link).toHaveAttribute('target', '_blank');
	});
});
