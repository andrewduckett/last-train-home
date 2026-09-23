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

it.each([
	['missing title', {}],
	['null title', { title: null }],
	['undefined title', { title: undefined }],
	['numeric title', { title: 12 }],
	['boolean title', { title: false }],
	['object title', { title: {} }],
	['array title', { title: [] }],
	['null record', null],
	['primitive record', 'not a record'],
])('resolves %s to invalid', async (_name, source) => {
	const provider = createCrawlProvider(() => source);
	await expect(provider.getCrawl('invalid')).resolves.toMatchObject({ status: 'invalid', id: 'invalid' });
});

it.each(['', '   ', '\t\n'])('preserves an authored blank title %j', async (title) => {
	const provider = createCrawlProvider(() => ({ ...record, title }));
	await expect(provider.getCrawl('blank')).resolves.toEqual({
		status: 'found', crawl: { ...record, title, id: 'blank' },
	});
});

describe.each(['date', 'color'])('optional %s', (field) => {
	it.each([null, undefined, 12, false, {}, []].map((value) => [value]))('rejects a present non-string value %j', async (value) => {
		const provider = createCrawlProvider(() => ({ ...record, [field]: value }));
		await expect(provider.getCrawl('bad-field')).resolves.toMatchObject({ status: 'invalid', id: 'bad-field' });
	});

	it.each(['', 'authored value'])('preserves an authored string %j', async (value) => {
		const provider = createCrawlProvider(() => ({ ...record, [field]: value }));
		await expect(provider.getCrawl('optional')).resolves.toEqual({
			status: 'found', crawl: { ...record, id: 'optional', [field]: value },
		});
	});
});

it('preserves uninterpreted identity strings', async () => {
	const source = { ...record, color: 'not-a-palette', date: 'not-a-date' };
	const provider = createCrawlProvider(() => source);
	await expect(provider.getCrawl('uninterpreted')).resolves.toEqual({
		status: 'found', crawl: { ...source, id: 'uninterpreted' },
	});
});

it('carries every definition field through untouched', async () => {
	const definition = {
		appTitle: 'Different header', line: 'A → B',
		schedule: [{ custom: 'entry' }], venues: ['uninterpreted'],
		scavenger: null, scavengerRules: ['Keep this rule'],
		map: { embed: 'embed', app: 'viewer' }, links: [{ label: 'Tickets', url: 'tickets' }], albumUrl: 'photos',
		extraAuthoredField: { keep: true },
	};
	const provider = createCrawlProvider(() => ({ title: 'Valid identity', definition }));
	const result = await provider.getCrawl('opaque');
	expect(result.status).toBe('found');
	if (result.status !== 'found') throw new Error('Expected found');
	expect(result.crawl.definition).toBe(definition);
});
