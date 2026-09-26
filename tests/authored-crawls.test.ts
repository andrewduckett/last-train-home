// The only test that reads authored crawl sources. It checks each one against
// the crawl contract and never asserts on authored content.
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { defaultCrawl } from '../src/lib/config.js';
import { checkAuthoredCrawls } from './fixtures/authored-crawls.js';
import { buildRecord } from './fixtures/crawl-builders.js';
import { toCrawlYaml } from './fixtures/crawl-provider.js';

it('accepts every authored crawl and the configured default', async () => {
	const ids = await checkAuthoredCrawls(resolve('static/crawls'), defaultCrawl);
	expect(ids).toContain(defaultCrawl);
});

describe('the contract check', () => {
	let directory = '';

	function crawlDirectory(files: Record<string, string>) {
		directory = mkdtempSync(join(tmpdir(), 'crawls-'));
		for (const [name, source] of Object.entries(files)) writeFileSync(join(directory, name), source);
		return directory;
	}

	afterEach(() => {
		if (directory) rmSync(directory, { recursive: true, force: true });
		directory = '';
	});

	it('passes a valid record whatever its content', async () => {
		const edited = buildRecord({
			title: 'Renamed',
			color: 'teal',
			definition: { appTitle: 'Renamed', intro: 'New words.', links: [], places: [] },
		});
		const dir = crawlDirectory({ 'main.yaml': toCrawlYaml(buildRecord()), 'edited.yaml': toCrawlYaml(edited) });
		await expect(checkAuthoredCrawls(dir, 'main')).resolves.toEqual(['edited', 'main']);
	});

	it('finds a record that no test names', async () => {
		const dir = crawlDirectory({
			'main.yaml': toCrawlYaml(buildRecord()),
			'added-later.yaml': toCrawlYaml(buildRecord()),
		});
		await expect(checkAuthoredCrawls(dir, 'main')).resolves.toContain('added-later');
	});

	it('fails a record that breaks validation and names its file', async () => {
		const dir = crawlDirectory({
			'main.yaml': toCrawlYaml(buildRecord()),
			'broken.yaml': toCrawlYaml(buildRecord({ definition: { scavenger: [] } })),
		});
		await expect(checkAuthoredCrawls(dir, 'main')).rejects.toThrow(/broken\.yaml/);
	});

	it('fails when the configured default has no record and names the id', async () => {
		const dir = crawlDirectory({ 'main.yaml': toCrawlYaml(buildRecord()) });
		await expect(checkAuthoredCrawls(dir, 'missing-default')).rejects.toThrow(/missing-default/);
	});
});
