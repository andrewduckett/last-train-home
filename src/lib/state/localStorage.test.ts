import { beforeEach, expect, it, vi } from 'vitest';
import { localStorageChecksStore } from './localStorage.js';

beforeEach(() => {
	localStorage.clear();
	vi.restoreAllMocks();
});

it('keeps checks under each logical crawl id', () => {
	expect(localStorageChecksStore.saveChecks('first', { shared: true })).toBe(true);
	expect(localStorage.getItem('crawl-checks:first')).toBe('{"shared":true}');
	expect(localStorageChecksStore.loadChecks('second')).toEqual({ status: 'ok', checks: {} });
});

it.each([null, 'not-json', '[]', '42', 'null'])('treats missing or malformed data %j as empty', (raw) => {
	if (raw !== null) localStorage.setItem('crawl-checks:first', raw);
	expect(localStorageChecksStore.loadChecks('first')).toEqual({ status: 'ok', checks: {} });
});

it('keeps only own entries with literal true values', () => {
	localStorage.setItem('crawl-checks:first', JSON.stringify({ yes: true, no: false, string: 'true', number: 1 }));
	expect(localStorageChecksStore.loadChecks('first')).toEqual({ status: 'ok', checks: { yes: true } });
});

it('does not inherit prototype properties in loaded checks', () => {
	localStorage.setItem('crawl-checks:first', '{"constructor":true}');
	const result = localStorageChecksStore.loadChecks('first');
	expect(result.status).toBe('ok');
	if (result.status === 'ok') {
		expect(Object.keys(result.checks)).toEqual(['constructor']);
		expect(Object.hasOwn(result.checks, 'toString')).toBe(false);
	}
});

it('ignores the old global key', () => {
	localStorage.setItem('crawl-checks-v1', '{"shared":true}');
	expect(localStorageChecksStore.loadChecks('first')).toEqual({ status: 'ok', checks: {} });
});

it('reports unavailable reads without throwing', () => {
	vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
	expect(localStorageChecksStore.loadChecks('first')).toEqual({ status: 'unavailable' });
});

it('reports successful writes', () => {
	expect(localStorageChecksStore.saveChecks('first', { yes: true })).toBe(true);
});

it('reports failed writes without throwing', () => {
	vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full'); });
	expect(localStorageChecksStore.saveChecks('first', { yes: true })).toBe(false);
});
