import { expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import Shell from './Shell.svelte';
import seed from '../../tests/fixtures/cory-trent.json';

async function openTab(tab: string) {
	const rendered = render(Shell);
	await screen.findByTestId('view-schedule');
	if (tab !== 'schedule') {
		await fireEvent.click(screen.getByRole('button', { name: new RegExp(tab, 'i') }));
	}
	return rendered;
}

it('preserves the seed header', async () => {
	await openTab('schedule');
	expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(seed.appTitle);
	expect(screen.getByText(seed.line)).toBeInTheDocument();
});

it('preserves every schedule entry in authored order', async () => {
	const { container } = await openTab('schedule');
	const entries = container.querySelectorAll('.timeline-entry');
	expect(entries).toHaveLength(seed.schedule.length);
	seed.schedule.forEach((entry, index) => {
		const row = within(entries[index] as HTMLElement);
		expect(row.getByText(entry.t)).toBeInTheDocument();
		expect(row.getByText(entry.title)).toBeInTheDocument();
		expect(row.getByText(entry.sub)).toBeInTheDocument();
		expect(entries[index].querySelector('.entry-tag')).toHaveTextContent(entry.tag);
	});
});

it('preserves the quick-link destinations', async () => {
	await openTab('schedule');
	expect(screen.getByRole('link', { name: /Ventra/ })).toHaveAttribute('href', seed.ventraUrl);
	expect(screen.getByRole('link', { name: /Metra/ })).toHaveAttribute('href', seed.metraUrl);
});
