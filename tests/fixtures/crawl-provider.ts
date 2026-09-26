// Serves generated records through the real providers, without reading any
// authored crawl. Shell and route tests use recordProvider; provider tests use
// yamlProvider so YAML parsing stays covered.
import { stringify } from 'yaml';
import { createCrawlProvider, createYamlCrawlProvider, type CrawlProvider } from '../../src/lib/data/provider.js';
import type { CrawlRecord } from './crawl-builders.js';

export function toCrawlYaml(record: CrawlRecord): string {
	return stringify(record);
}

export function recordProvider(records: Record<string, CrawlRecord>): CrawlProvider {
	return createCrawlProvider((id) => (Object.hasOwn(records, id) ? records[id] : undefined));
}

// A string value is served as raw YAML, so a test can supply malformed text.
export function yamlProvider(records: Record<string, CrawlRecord | string>): CrawlProvider {
	return createYamlCrawlProvider(async (path) => {
		const id = /^\/crawls\/(.+)\.yaml$/.exec(path)?.[1];
		const record = id !== undefined && Object.hasOwn(records, id) ? records[id] : undefined;
		const source = typeof record === 'string' ? record : record && toCrawlYaml(record);
		return {
			ok: source !== undefined,
			status: source === undefined ? 404 : 200,
			headers: { get: () => 'application/yaml' },
			text: async () => source ?? '',
		};
	});
}
