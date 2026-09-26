import { afterEach, expect, it, vi } from 'vitest';
import { buildRecord } from '../../../tests/fixtures/crawl-builders.js';
import { toCrawlYaml } from '../../../tests/fixtures/crawl-provider.js';
import { getCrawl } from './provider.js';

afterEach(() => {
	vi.unstubAllGlobals();
});

it('resolves a crawl through the production provider and fetch', async () => {
	const record = buildRecord();
	const fetchCrawl = vi.fn(async () => ({
		ok: true,
		status: 200,
		headers: { get: () => 'application/yaml' },
		text: async () => toCrawlYaml(record),
	}));
	vi.stubGlobal('fetch', fetchCrawl);
	await expect(getCrawl('lantern-loop')).resolves.toEqual({
		status: 'found',
		crawl: { id: 'lantern-loop', ...record },
	});
	expect(fetchCrawl).toHaveBeenCalledWith('/crawls/lantern-loop.yaml');
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
