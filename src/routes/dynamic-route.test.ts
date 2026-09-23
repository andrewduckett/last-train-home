import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

it('passes the direct path id into the keyed crawl route', () => {
	const source = readFileSync(resolve('src/routes/[id]/+page.svelte'), 'utf8');
	expect(source).toMatch(/page\.params\.id/);
	expect(source).toMatch(/<CrawlRoute \{id\} \/>/);
});

it('leaves dynamic paths to the SPA fallback', () => {
	const source = readFileSync(resolve('src/routes/[id]/+page.ts'), 'utf8');
	expect(source).toMatch(/export const prerender = false/);
});
