import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import { buildRecord } from '../../tests/fixtures/crawl-builders.js';
import { recordProvider } from '../../tests/fixtures/crawl-provider.js';
import Shell from './Shell.svelte';

const shellProps = { id: 'lantern-loop', getCrawl: recordProvider({ 'lantern-loop': buildRecord() }).getCrawl };

describe('Shell navigation', () => {
	it('opens on the Schedule tab', async () => {
		render(Shell, shellProps);
		await screen.findByTestId('view-schedule');
		expect(screen.getByRole('button', { name: /schedule/i })).toHaveAttribute('aria-current', 'page');
		expect(screen.queryByTestId('view-schedule')).not.toBeNull();
	});

	it('tapping a tab switches the view and marks it active', async () => {
		render(Shell, shellProps);
		await screen.findByTestId('view-schedule');
		const placesBtn = screen.getByRole('button', { name: /places/i });
		await fireEvent.click(placesBtn);
		expect(placesBtn).toHaveAttribute('aria-current', 'page');
		expect(screen.queryByTestId('view-places')).not.toBeNull();
		expect(screen.queryByTestId('view-schedule')).toBeNull();
	});

	it('shows a Places tab with a pin icon in place of Venues', async () => {
		render(Shell, shellProps);
		await screen.findByTestId('view-schedule');
		const placesBtn = screen.getByRole('button', { name: /places/i });
		expect(placesBtn.querySelector('[data-icon="map-pin"]')).not.toBeNull();
		expect(screen.queryByRole('button', { name: /venues/i })).not.toBeInTheDocument();
	});

	it('shows no Map tab', async () => {
		render(Shell, shellProps);
		await screen.findByTestId('view-schedule');
		expect(screen.getAllByRole('button').map((button) => button.querySelector('.nav-label')?.textContent?.trim()).filter(Boolean)).toEqual(['Schedule', 'Places', 'Tasks', 'Info']);
		expect(screen.queryByRole('button', { name: /map/i })).not.toBeInTheDocument();
	});

	it('tapping a tab scrolls to top', async () => {
		const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
		render(Shell, shellProps);
		await screen.findByTestId('view-schedule');
		await fireEvent.click(screen.getByRole('button', { name: /tasks/i }));
		expect(scrollTo).toHaveBeenCalledWith(0, 0);
		scrollTo.mockRestore();
	});
});

describe('Shell icons', () => {
	const EMOJI = /\p{Extended_Pictographic}/u;
	const TAB_ICONS = [['Schedule', 'clock'], ['Places', 'map-pin'], ['Tasks', 'checklist'], ['Info', 'info']];

	async function renderShell() {
		const rendered = render(Shell, shellProps);
		await screen.findByTestId('view-schedule');
		return rendered.container;
	}

	it('shows each tab icon and no emoji in the tab bar', async () => {
		const container = await renderShell();
		for (const [label, icon] of TAB_ICONS) {
			expect(screen.getByRole('button', { name: label }).querySelector(`[data-icon="${icon}"]`)).not.toBeNull();
		}
		expect(container.querySelector('nav')?.textContent).not.toMatch(EMOJI);
	});

	it('shows the train icon and no emoji in the header', async () => {
		const container = await renderShell();
		const header = container.querySelector('header');
		expect(header?.querySelector('[data-icon="train"]')).not.toBeNull();
		expect(header?.textContent).not.toMatch(EMOJI);
	});

	it('lets every icon inherit its color, with no inline opacity', async () => {
		const container = await renderShell();
		const icons = Array.from(container.querySelectorAll<HTMLElement>('[data-icon]'));
		expect(icons).toHaveLength(5);
		for (const icon of icons) {
			expect(Array.from(icon.style)).toEqual(['width', 'height']);
			expect(icon.querySelector('svg')).toHaveAttribute('stroke', 'currentColor');
		}
		expect(container.querySelector('nav [style*="opacity"]')).toBeNull();
	});

	it('names each tab by its label alone, with hidden icons', async () => {
		const container = await renderShell();
		for (const [label] of TAB_ICONS) expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
		for (const icon of container.querySelectorAll('[data-icon]')) expect(icon).toHaveAttribute('aria-hidden', 'true');
	});
});
