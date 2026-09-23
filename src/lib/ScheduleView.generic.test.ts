import { expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/svelte';
import ScheduleView from './ScheduleView.svelte';
import type { Crawl } from './types.js';

function show(schedule: unknown) {
	return render(ScheduleView, { crawl: { id: 'walk', title: 'Walk', definition: { schedule, links: [] } } as unknown as Crawl });
}

it('shows stops, moves, and notes in authored order with fallback tags', () => {
	const { container } = show([
		{ kind: 'stop', time: '1:00', title: 'Cafe', note: 'Meet outside' },
		{ kind: 'move', time: '1:30', title: 'To park', mode: '15 min walk', note: 'Use the bridge' },
		{ kind: 'note', time: '2:00', title: 'Take a photo', tag: 'Reminder' },
	]);
	const rows = [...container.querySelectorAll('.timeline-entry')];
	expect(rows).toHaveLength(3);
	expect(rows.map((row) => row.querySelector('.entry-title')?.textContent)).toEqual(['Cafe', 'To park', 'Take a photo']);
	expect(within(rows[0] as HTMLElement).getByText('Stop')).toBeInTheDocument();
	expect(within(rows[1] as HTMLElement).getByText('Move')).toBeInTheDocument();
	expect(within(rows[2] as HTMLElement).getByText('Reminder')).toBeInTheDocument();
	expect(rows.map((row) => row.getAttribute('data-kind'))).toEqual(['stop', 'move', 'note']);
	expect(rows[1].textContent?.indexOf('15 min walk')).toBeLessThan(rows[1].textContent!.indexOf('Use the bridge'));
});

it('omits malformed entries without hiding valid siblings', () => {
	const { container } = show([
		{ kind: 'stop', time: '1:00', title: 'First' },
		{ kind: 'depart', time: '1:30', title: 'Old kind' },
		{ kind: 'move', time: '2:00', title: 'Missing mode' },
		{ kind: 'note', time: '2:30', title: 'Last' },
	]);
	expect(container.querySelectorAll('.timeline-entry')).toHaveLength(2);
	expect(screen.getByText('First')).toBeInTheDocument();
	expect(screen.getByText('Last')).toBeInTheDocument();
});

it('shows an unavailable message for a missing schedule', () => {
	show(undefined);
	expect(screen.getByText(/schedule unavailable/i)).toBeInTheDocument();
});
