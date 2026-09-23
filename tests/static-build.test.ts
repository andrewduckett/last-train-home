import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

it('contains the SPA fallback shell', () => {
	expect(existsSync(resolve('build/index.html'))).toBe(true);
});

it('contains the cory-trent YAML record', () => {
	const source = readFileSync(resolve('build/crawls/cory-trent.yaml'), 'utf8');
	expect(source).toContain('title: Last Train Home');
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
