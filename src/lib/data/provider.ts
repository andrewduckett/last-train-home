import type { CrawlDefinition, CrawlResult } from '../types.js';

export interface CrawlProvider {
	getCrawl(id: string): Promise<CrawlResult>;
}

export function createCrawlProvider(retrieve: (id: string) => unknown): CrawlProvider {
	return {
		async getCrawl(id) {
			try {
				const record = retrieve(id);
				if (record === undefined) return { status: 'not-found', id };
				if (typeof record !== 'object' || record === null || !('title' in record)) {
					return { status: 'invalid', id };
				}
				const { title } = record;
				if (typeof title !== 'string') return { status: 'invalid', id };
				return { status: 'found', crawl: {
					id, title, definition: (record as { definition: CrawlDefinition }).definition,
				} };
			} catch {
				return { status: 'error', id };
			}
		},
	};
}
