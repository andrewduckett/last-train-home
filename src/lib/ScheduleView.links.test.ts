import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ScheduleView from './ScheduleView.svelte';
import type { Crawl } from './types.js';

function show(links: unknown) {
	return render(ScheduleView, { crawl: { id: 'walk', title: 'Walk', definition: { schedule: [], links } } as unknown as Crawl });
}

it('shows no cards for an empty link list', () => {
	const { container } = show([]);
	expect(container.querySelectorAll('.quick-link')).toHaveLength(0);
});

it('shows one authored link with its hint and new-tab attributes', () => {
	show([{ label: 'Tickets', hint: 'Buy a pass', url: 'https://example.com/tickets' }]);
	const link = screen.getByRole('link', { name: /Tickets/ });
	expect(link).toHaveTextContent('Buy a pass');
	expect(link).toHaveAttribute('href', 'https://example.com/tickets');
	expect(link).toHaveAttribute('target', '_blank');
	expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});

it('keeps three links in order with wrapping cards', () => {
	const { container } = show(['First', 'Second', 'Third'].map((label) => ({ label, url: `https://example.com/${label}` })));
	expect([...container.querySelectorAll('.quick-link')].map((link) => link.textContent?.trim())).toEqual(['First', 'Second', 'Third']);
	expect(container.querySelector('.quick-links')).toHaveClass('quick-links-wrap');
});

it('omits links with missing labels or unsafe URLs', () => {
	const { container } = show([{ url: 'https://example.com' }, { label: 'Unsafe', url: 'javascript:alert(1)' }, { label: 'Good', url: 'https://example.com/good' }]);
	expect(container.querySelectorAll('.quick-link')).toHaveLength(1);
	expect(screen.getByRole('link', { name: 'Good' })).toBeInTheDocument();
});
