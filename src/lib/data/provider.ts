import { crawl } from '../crawl.js';
import type { CrawlDefinition, CrawlIdentity, CrawlResult } from '../types.js';

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
				const source = record as Record<string, unknown>;
				const { title } = source;
				if (typeof title !== 'string') return { status: 'invalid', id };
				const identity: CrawlIdentity = { id, title };
				for (const field of ['date', 'color'] as const) {
					if (field in record) {
						const value = source[field];
						if (typeof value !== 'string') return { status: 'invalid', id };
						identity[field] = value;
					}
				}
				return { status: 'found', crawl: {
					...identity, definition: source.definition as CrawlDefinition,
				} };
			} catch {
				return { status: 'error', id };
			}
		},
	};
}

const records = new Map([['cory-trent', { title: crawl.appTitle, definition: crawl }]]);

export const { getCrawl } = createCrawlProvider((id) => records.get(id));
