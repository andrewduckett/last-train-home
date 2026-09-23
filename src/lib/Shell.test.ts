import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import { seedShellProps } from '../../tests/fixtures/seed-provider.js';
import Shell from './Shell.svelte';

describe('Shell navigation', () => {
	it('opens on the Schedule tab', async () => {
		render(Shell, seedShellProps);
		await screen.findByTestId('view-schedule');
		expect(screen.getByRole('button', { name: /schedule/i })).toHaveAttribute('aria-current', 'page');
		expect(screen.queryByTestId('view-schedule')).not.toBeNull();
	});

	it('tapping a tab switches the view and marks it active', async () => {
		render(Shell, seedShellProps);
		await screen.findByTestId('view-schedule');
		const venuesBtn = screen.getByRole('button', { name: /venues/i });
		await fireEvent.click(venuesBtn);
		expect(venuesBtn).toHaveAttribute('aria-current', 'page');
		expect(screen.queryByTestId('view-venues')).not.toBeNull();
		expect(screen.queryByTestId('view-schedule')).toBeNull();
	});

	it('tapping a tab scrolls to top', async () => {
		const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
		render(Shell, seedShellProps);
		await screen.findByTestId('view-schedule');
		await fireEvent.click(screen.getByRole('button', { name: /map/i }));
		expect(scrollTo).toHaveBeenCalledWith(0, 0);
		scrollTo.mockRestore();
	});
});
