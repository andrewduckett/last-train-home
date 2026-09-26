import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ScheduleView from './ScheduleView.svelte';
import { buildCrawl, moveEntry, noteEntry, stopEntry } from '../../tests/fixtures/crawl-builders.js';

const schedule = [
	stopEntry({ time: '5:00 PM', title: 'Gather at the pier' }),
	moveEntry({ time: '5:15 PM', title: 'Stroll inland', mode: '12 min walk' }),
	noteEntry({ time: '6:40 PM', title: 'Last call soon' }),
	stopEntry({ time: '7:00 PM', title: 'Wrap at the gardens' }),
];
const crawl = buildCrawl('lantern-loop', { definition: { schedule } });

describe('ScheduleView', () => {
	it('renders every schedule entry in authored order', () => {
		const { container } = render(ScheduleView, { crawl });
		const entries = [...container.querySelectorAll('.timeline-entry')];
		expect(entries).toHaveLength(schedule.length);
		entries.forEach((entry, index) => expect(entry).toHaveTextContent(schedule[index].title));
	});

	it('shows all schedule entries', () => {
		render(ScheduleView, { crawl });
		for (const entry of schedule) {
			expect(screen.getAllByText(entry.title).length).toBeGreaterThan(0);
		}
	});

	it('shows times for each entry', () => {
		render(ScheduleView, { crawl });
		for (const entry of schedule) {
			expect(screen.getAllByText(entry.time).length).toBeGreaterThan(0);
		}
	});
});
