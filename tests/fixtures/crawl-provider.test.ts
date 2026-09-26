import { expect, it } from 'vitest';
import { parse } from 'yaml';
import { buildRecord } from './crawl-builders.js';
import { recordProvider, toCrawlYaml, yamlProvider } from './crawl-provider.js';

const record = buildRecord({ color: 'teal', definition: { appTitle: 'Provided' } });

it('serializes a record to YAML that parses back to the same record', () => {
	expect(parse(toCrawlYaml(record))).toEqual(record);
});

it.each([
	['recordProvider', recordProvider],
	['yamlProvider', yamlProvider],
])('%s resolves a known id to the given record', async (_, provider) => {
	const { getCrawl } = provider({ 'lantern-loop': record });
	await expect(getCrawl('lantern-loop')).resolves.toEqual({
		status: 'found',
		crawl: { id: 'lantern-loop', ...record },
	});
});

it.each([
	['recordProvider', recordProvider],
	['yamlProvider', yamlProvider],
])('%s returns not-found for an unknown id', async (_, provider) => {
	const { getCrawl } = provider({ 'lantern-loop': record });
	await expect(getCrawl('other-loop')).resolves.toEqual({ status: 'not-found', id: 'other-loop' });
});

it('yamlProvider serves raw YAML text as authored', async () => {
	const { getCrawl } = yamlProvider({ broken: 'title: [unclosed' });
	await expect(getCrawl('broken')).resolves.toEqual({ status: 'invalid', id: 'broken' });
});
