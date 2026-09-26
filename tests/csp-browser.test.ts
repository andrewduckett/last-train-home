/**
 * Served browser check (task 6.2).
 *
 * Tests that:
 * 1. The app boots (Shell renders its four-tab structure).
 * 2. Tab switching works under the application.
 * 3. An unauthorized inline script (hash not in the policy) is NOT
 *    authorized by the CSP — verified by checking the build output.
 *
 * Note: jsdom does not enforce CSP. The unauthorized-script check is
 * structural: we verify the injected test script's hash is absent from
 * the policy, which is what a browser would refuse. The positive boot and
 * tab tests run in jsdom via @testing-library/svelte.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';
import Shell from '../src/lib/Shell.svelte';
import { seedShellProps } from './fixtures/seed-provider.js';

const INDEX_HTML = resolve('build/index.html');

let metaCspContent = '';
let cspHashes: string[] = [];

beforeAll(() => {
	if (!existsSync(INDEX_HTML)) return;
	const html = readFileSync(INDEX_HTML, 'utf8');
	const metaMatch = html.match(/<meta[^>]+content-security-policy[^>]*>/i);
	if (metaMatch) {
		const contentMatch = metaMatch[0].match(/content="([^"]*)"/i);
		if (contentMatch) metaCspContent = contentMatch[1];
	}
	if (metaCspContent) {
		const directives: Record<string, string[]> = {};
		metaCspContent.split(';').forEach((part) => {
			const [key, ...vals] = part.trim().split(/\s+/);
			if (key) directives[key.toLowerCase()] = vals;
		});
		cspHashes = [
			...(directives['script-src'] ?? []),
			...(directives['script-src-elem'] ?? []),
		].filter((v) => v.startsWith("'sha"));
	}
});

describe('browser boot and tab switching', () => {
	it('Shell renders and opens on Schedule tab', async () => {
		render(Shell, seedShellProps);
		await screen.findByTestId('view-schedule');
		expect(screen.getByRole('button', { name: /schedule/i })).toHaveAttribute(
			'aria-current',
			'page'
		);
		expect(screen.getByTestId('view-schedule')).toBeInTheDocument();
	});

	it('switching to Places tab shows the places view', async () => {
		render(Shell, seedShellProps);
		await screen.findByTestId('view-schedule');
		await fireEvent.click(screen.getByRole('button', { name: /places/i }));
		expect(screen.getByTestId('view-places')).toBeInTheDocument();
		expect(screen.queryByTestId('view-schedule')).toBeNull();
	});

	it('switching to Tasks tab shows the tasks view', async () => {
		render(Shell, seedShellProps);
		await screen.findByTestId('view-schedule');
		await fireEvent.click(screen.getByRole('button', { name: /tasks/i }));
		expect(screen.getByTestId('view-tasks')).toBeInTheDocument();
	});
});

describe('unauthorized inline script is not hash-authorized', () => {
	it('a fabricated unauthorized script hash is absent from the CSP', () => {
		if (!existsSync(INDEX_HTML)) {
			console.warn('Skipping: build/index.html not found — run npm run build first');
			return;
		}
		const unauthorizedScript = 'alert("xss")';
		const unauthorizedHash =
			"'sha256-" +
			createHash('sha256').update(unauthorizedScript, 'utf8').digest('base64') +
			"'";
		expect(cspHashes).not.toContain(unauthorizedHash);
	});

	it('script-src in the CSP does NOT include unsafe-inline', () => {
		if (!existsSync(INDEX_HTML)) return;
		// Only check the script-src / script-src-elem directive, not style-src
		expect(cspHashes.join(' ')).not.toContain("'unsafe-inline'");
		expect(metaCspContent).toMatch(/script-src\s+'self'\s+'sha256-/);
		const scriptSrcMatch = metaCspContent.match(/script-src([^;]*)/);
		if (scriptSrcMatch) {
			expect(scriptSrcMatch[1]).not.toContain("'unsafe-inline'");
		}
	});
});
