import type { Crawl, CrawlResult } from '../types.js';

export interface CrawlProvider {
	getCrawl(id: string): Promise<CrawlResult>;
}

export function createCrawlProvider(retrieve: (id: string) => unknown): CrawlProvider {
	return {
		async getCrawl(id) {
			const record = retrieve(id) as Omit<Crawl, 'id'>;
			if (record === undefined) return { status: 'not-found', id };
			return { status: 'found', crawl: { ...record, id } };
		},
	};
}
