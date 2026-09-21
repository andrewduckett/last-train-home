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
