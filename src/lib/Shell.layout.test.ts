import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import Shell from './Shell.svelte';

const appCss = readFileSync(resolve('src/app.css'), 'utf8');

describe('Shell: phone-first layout', () => {
	it('has a sticky header element', () => {
		const { container } = render(Shell);
		const header = container.querySelector('header.shell-header');
		expect(header).toBeTruthy();
	});

	it('has a sticky nav element', () => {
		const { container } = render(Shell);
		const nav = container.querySelector('nav.shell-nav');
		expect(nav).toBeTruthy();
	});

	it('app.css includes prefers-reduced-motion rule that disables transitions and animations', () => {
		expect(appCss).toMatch(/prefers-reduced-motion:\s*reduce/);
		expect(appCss).toMatch(/transition:\s*none/);
		expect(appCss).toMatch(/animation:\s*none/);
	});

	it('app.css includes prefers-color-scheme dark rule', () => {
		expect(appCss).toMatch(/prefers-color-scheme:\s*dark/);
	});

	it('app.css includes safe-area-inset-bottom for bottom nav', () => {
		expect(appCss).toMatch(/safe-area-inset-bottom/);
	});
});
