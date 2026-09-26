import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

it('contains the SPA fallback shell', () => {
	expect(existsSync(resolve('build/index.html'))).toBe(true);
});

it('publishes every authored crawl unchanged', () => {
	const authored = readdirSync(resolve('static/crawls')).filter((name) => name.endsWith('.yaml'));
	expect(authored.length).toBeGreaterThan(0);
	for (const name of authored) {
		expect(readFileSync(resolve('build/crawls', name)), name).toEqual(readFileSync(resolve('static/crawls', name)));
	}
});

it('contains the static security headers', () => {
	const source = readFileSync(resolve('build/_headers'), 'utf8');
	expect(source).toContain("Content-Security-Policy: frame-ancestors 'none'");
});

it('contains no server entry point', () => {
	expect(existsSync(resolve('build/server'))).toBe(false);
	expect(existsSync(resolve('build/_worker.js'))).toBe(false);
	expect(existsSync(resolve('build/functions'))).toBe(false);
});

describe('shell icons in the build', () => {
	function filesUnder(directory: string): string[] {
		return readdirSync(directory, { recursive: true, encoding: 'utf8' }).map((file) => join(directory, file));
	}

	// Maps each single class selector (scope suffix removed) to its declarations.
	function cssRules(): Array<[string, string]> {
		const css = filesUnder(resolve('build/_app')).filter((file) => file.endsWith('.css')).map((file) => readFileSync(file, 'utf8')).join('\n');
		const rules: Array<[string, string]> = [];
		for (const [, selectors, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
			for (const selector of selectors.split(',')) rules.push([selector.trim().replace(/\.svelte-[\w-]+/g, ''), body]);
		}
		return rules;
	}

	function declarations(selector: string): string {
		return cssRules().filter(([name]) => name === selector).map(([, body]) => body).join(';');
	}

	it('colors the tab buttons and header icon from board tokens', () => {
		expect(declarations('.nav-btn')).toContain('color:var(--board-muted)');
		expect(declarations('.nav-btn-active')).toContain('color:var(--board-accent)');
		expect(declarations('.header-icon')).toContain('color:var(--board-ink)');
	});

	it('dims no nav element with opacity', () => {
		for (const [selector, body] of cssRules().filter(([name]) => name.includes('nav'))) {
			for (const [, value] of body.matchAll(/opacity:\s*([\d.]+)/g)) expect(Number(value), selector).toBeGreaterThanOrEqual(1);
		}
	});

	it('ships no icon files and inlines the icon drawings in the bundle', () => {
		const files = filesUnder(resolve('build'));
		for (const icon of ['checklist', 'clock', 'info', 'map-pin', 'train']) {
			expect(files.some((file) => basename(file) === `${icon}.svg`), icon).toBe(false);
		}
		const pin = readFileSync(resolve('src/lib/icons/map-pin.svg'), 'utf8').match(/ d="([^"]+)"/)?.[1] ?? '';
		expect(pin).not.toBe('');
		const bundle = files.filter((file) => file.endsWith('.js')).map((file) => readFileSync(file, 'utf8')).join('\n');
		expect(bundle).toContain(pin);
	});
});
