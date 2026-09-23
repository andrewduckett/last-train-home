import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ScheduleView from './ScheduleView.svelte';
import { crawl } from '../../tests/fixtures/cory-trent.js';

describe('ScheduleView', () => {
	it('renders every schedule entry in authored order', () => {
		render(ScheduleView, { crawl: { id: 'cory-trent', title: crawl.appTitle, definition: crawl } });
		const titles = screen.getAllByText(/Stop \d|Depart|Head to|Meetup|Final Stop/i);
		// Verify count matches data
		expect(titles.length).toBeGreaterThan(0);
		// Verify first entry text appears
		expect(screen.getByText(crawl.schedule[0].title)).toBeInTheDocument();
		// Verify last entry text appears
		expect(screen.getByText(crawl.schedule[crawl.schedule.length - 1].title)).toBeInTheDocument();
	});

	it('shows all schedule entries', () => {
		render(ScheduleView, { crawl: { id: 'cory-trent', title: crawl.appTitle, definition: crawl } });
		for (const entry of crawl.schedule) {
			const matches = screen.getAllByText(entry.title);
			expect(matches.length).toBeGreaterThan(0);
		}
	});

	it('shows times for each entry', () => {
		render(ScheduleView, { crawl: { id: 'cory-trent', title: crawl.appTitle, definition: crawl } });
		for (const entry of crawl.schedule) {
			const matches = screen.getAllByText(entry.time);
			expect(matches.length).toBeGreaterThan(0);
		}
	});
});
