import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ScheduleView from './ScheduleView.svelte';
import type { Crawl } from './types.js';

function show(links: unknown) {
	return render(ScheduleView, { crawl: { id: 'walk', title: 'Walk', definition: { schedule: [], links } } as unknown as Crawl });
}

it('keeps quick links off Schedule', () => {
	const { container } = show([{ label: 'Tickets', url: 'https://example.com/tickets' }]);
	expect(container.querySelector('.rail-track')).toBeInTheDocument();
	expect(screen.queryByRole('link', { name: 'Tickets' })).not.toBeInTheDocument();
});
