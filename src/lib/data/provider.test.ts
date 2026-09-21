import { describe, expect, it } from 'vitest';
import { createCrawlProvider } from './provider.js';

const record = { title: 'An authored title', definition: { appTitle: 'Display title' } };

describe('crawl provider', () => {
	it('resolves an available record using the requested logical id', async () => {
		const provider = createCrawlProvider(() => ({ ...record, id: 'untrusted-id' }));
		const result = provider.getCrawl('evening-out');
		expect(result).toBeInstanceOf(Promise);
		await expect(result).resolves.toEqual({
			status: 'found', crawl: { ...record, id: 'evening-out' },
		});
	});
});

it('resolves a missing record to not-found', async () => {
	const provider = createCrawlProvider(() => undefined);
	await expect(provider.getCrawl('missing')).resolves.toEqual({ status: 'not-found', id: 'missing' });
});

it.each([
	['retrieval', () => { throw new Error('source unavailable'); }],
	['record access', () => ({ get title() { throw new Error('unreadable title'); } })],
])('resolves a %s exception to error', async (_name, retrieve) => {
	const provider = createCrawlProvider(retrieve);
	let result: ReturnType<typeof provider.getCrawl> | undefined;
	expect(() => { result = provider.getCrawl('broken'); }).not.toThrow();
	await expect(result).resolves.toMatchObject({ status: 'error', id: 'broken' });
});
