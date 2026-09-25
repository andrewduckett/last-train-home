import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import expectedDefinition from '../../../tests/fixtures/cory-trent.json';
import { getCrawl } from './provider.js';

afterEach(() => {
	vi.unstubAllGlobals();
});

it('resolves the original seed content through the production provider', async () => {
	const source = readFileSync(resolve('static/crawls/cory-trent.yaml'), 'utf8');
	const fetchCrawl = vi.fn(async () => ({
		ok: true,
		status: 200,
		headers: { get: () => 'application/yaml' },
		text: async () => source,
	}));
	vi.stubGlobal('fetch', fetchCrawl);
	await expect(getCrawl('cory-trent')).resolves.toEqual({
		status: 'found',
		crawl: {
			id: 'cory-trent',
			title: 'Cory & Trent: Last Train Home',
			color: 'amber',
			definition: expectedDefinition,
		},
	});
	expect(fetchCrawl).toHaveBeenCalledWith('/crawls/cory-trent.yaml');
});

it('publishes the welcome without an album placeholder', () => {
	expect(expectedDefinition.intro).toContain("Cory & Trent are getting married!");
	expect(expectedDefinition).not.toHaveProperty('albumUrl');
	expect(expectedDefinition.links.map((link) => link.label)).toEqual(['Ventra', 'Metra']);
});

it.each(['missing', 'constructor'])('does not resolve missing id %j', async (id) => {
	vi.stubGlobal('fetch', async () => ({
		ok: false,
		status: 404,
		headers: { get: () => 'text/html' },
		text: async () => '',
	}));
	await expect(getCrawl(id)).resolves.toEqual({ status: 'not-found', id });
});

it.each(['', 'toString', '__proto__', 'hasOwnProperty'])('does not request unsafe id %j', async (id) => {
	const fetchCrawl = vi.fn();
	vi.stubGlobal('fetch', fetchCrawl);
	await expect(getCrawl(id)).resolves.toEqual({ status: 'not-found', id });
	expect(fetchCrawl).not.toHaveBeenCalled();
});
