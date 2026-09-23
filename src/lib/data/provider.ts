import type { CrawlDefinition, CrawlIdentity, CrawlResult } from '../types.js';
import { LOGICAL_ID_PATTERN } from './id.js';
import { parseJsonYaml } from './yaml.js';

export interface CrawlProvider {
	getCrawl(id: string): Promise<CrawlResult>;
}

export interface CrawlResponse {
	ok: boolean;
	status: number;
	headers: { get(name: string): string | null };
	text(): Promise<string>;
}

export type CrawlFetch = (path: string) => Promise<CrawlResponse>;

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
				return {
					status: 'found',
					crawl: {
						...identity,
						// Domain layers own definition meaning; this boundary validates identity only.
						definition: source.definition as CrawlDefinition,
					},
				};
			} catch {
				return { status: 'error', id };
			}
		},
	};
}

export function createYamlCrawlProvider(fetchCrawl: CrawlFetch): CrawlProvider {
	return {
		async getCrawl(id) {
			if (!LOGICAL_ID_PATTERN.test(id)) return { status: 'not-found', id };
			let response: CrawlResponse;
			try {
				response = await fetchCrawl(`/crawls/${id}.yaml`);
			} catch {
				return { status: 'error', id };
			}
			if (response.status === 404) return { status: 'not-found', id };
			if (!response.ok) return { status: 'error', id };
			if (response.headers.get('content-type')?.toLowerCase().startsWith('text/html')) {
				return { status: 'not-found', id };
			}
			let source: string;
			try {
				source = await response.text();
			} catch {
				return { status: 'error', id };
			}
			let record: unknown;
			try {
				record = parseJsonYaml(source);
			} catch {
				return { status: 'invalid', id };
			}
			return createCrawlProvider(() => record).getCrawl(id);
		},
	};
}

export const { getCrawl } = createYamlCrawlProvider((path) => fetch(path));
