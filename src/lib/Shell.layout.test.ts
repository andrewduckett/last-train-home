import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { buildRecord } from '../../tests/fixtures/crawl-builders.js';
import { recordProvider } from '../../tests/fixtures/crawl-provider.js';
import Shell from './Shell.svelte';

const shellProps = { id: 'lantern-loop', getCrawl: recordProvider({ 'lantern-loop': buildRecord() }).getCrawl };

const appCss = readFileSync(resolve('src/app.css'), 'utf8');

describe('Shell: phone-first layout', () => {
	it('has a sticky header element', async () => {
		const { container } = render(Shell, shellProps);
		await screen.findByTestId('view-schedule');
		const header = container.querySelector('header.shell-header');
		expect(header).toBeTruthy();
	});

	it('has a sticky nav element', async () => {
		const { container } = render(Shell, shellProps);
		await screen.findByTestId('view-schedule');
		const nav = container.querySelector('nav.shell-nav');
		expect(nav).toBeTruthy();
	});

	it('app.css includes prefers-reduced-motion rule that disables transitions and animations', () => {
		expect(appCss).toMatch(/prefers-reduced-motion:\s*reduce/);
		expect(appCss).toMatch(/transition:\s*none/);
		expect(appCss).toMatch(/animation:\s*none/);
	});

	it('generated palette CSS follows the system dark scheme', () => {
		expect(appCss).toContain("@import './lib/theme/generated.css'");
		expect(readFileSync(resolve('src/lib/theme/generated.css'), 'utf8')).toMatch(/prefers-color-scheme:\s*dark/);
	});

	it('app.css includes safe-area-inset-bottom for bottom nav', () => {
		expect(appCss).toMatch(/safe-area-inset-bottom/);
	});
});
