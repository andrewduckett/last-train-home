import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import MapView from './MapView.svelte';
import { crawl } from './crawl.js';

describe('MapView', () => {
	it('renders an embedded map iframe', () => {
		render(MapView);
		const iframe = document.querySelector('iframe[title="Crawl route map"]');
		expect(iframe).toBeTruthy();
	});

	it('viewer link opens to the configured myMapsAppUrl', () => {
		render(MapView);
		const link = screen.getByTestId('map-viewer-link');
		expect(link).toHaveAttribute('href', crawl.myMapsAppUrl);
		expect(link).toHaveAttribute('target', '_blank');
	});
});
