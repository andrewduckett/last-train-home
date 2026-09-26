import { describe, expect, it } from 'vitest';
import { stringify } from 'yaml';
import { validateCrawlSource } from '../../src/lib/data/validate.js';
import {
	buildCrawl,
	buildDefinition,
	buildRecord,
	link,
	location,
	moveEntry,
	noteEntry,
	placeStop,
	stopEntry,
	task,
} from './crawl-builders.js';

describe('buildRecord', () => {
	it('passes build validation with its defaults', () => {
		expect(() => validateCrawlSource('generated.yaml', stringify(buildRecord()))).not.toThrow();
	});

	it('covers each shape the views branch on', () => {
		const { definition } = buildRecord();
		expect(definition.schedule.map((entry) => entry.kind)).toEqual(expect.arrayContaining(['stop', 'move', 'note']));
		const locations = definition.places.flatMap((stop) => stop.locations);
		expect(locations.map((place) => place.label)).toEqual(expect.arrayContaining(['Station', 'Pub', undefined]));
		expect(definition.places.some((stop) => stop.locations.length === 1)).toBe(true);
		expect(definition.scavenger.length).toBeGreaterThanOrEqual(2);
		expect(definition.links.length).toBeGreaterThanOrEqual(2);
		expect(definition.intro).toMatch(/\S/);
	});

	it('names no transit agency in its defaults', () => {
		const text = JSON.stringify(buildRecord());
		for (const agency of ['Metra', 'Ventra', 'CTA', 'Amtrak', 'MTA', 'BART']) {
			expect(text, agency).not.toMatch(new RegExp(`\\b${agency}\\b`));
		}
	});

	it('replaces only the fields a test overrides', () => {
		const base = buildRecord();
		const record = buildRecord({ color: 'teal', definition: { appTitle: 'Overridden' } });
		expect(record.color).toBe('teal');
		expect(record.title).toBe(base.title);
		expect(record.definition.appTitle).toBe('Overridden');
		expect(record.definition.schedule).toEqual(base.definition.schedule);
	});

	it('leaves color out when a test sets it to undefined', () => {
		expect(buildRecord({ color: undefined })).not.toHaveProperty('color');
	});

	it('returns a fresh object on each call', () => {
		const first = buildRecord();
		first.definition.schedule.push(stopEntry({ title: 'Added' }));
		first.definition.places[0].locations[0].name = 'Changed';
		expect(buildRecord()).not.toEqual(first);
		expect(buildDefinition()).toEqual(buildRecord().definition);
	});
});

describe('item builders', () => {
	it('build valid entries with overrides', () => {
		expect(stopEntry({ title: 'Here' })).toMatchObject({ kind: 'stop', title: 'Here' });
		expect(moveEntry({ mode: '5 min walk' })).toMatchObject({ kind: 'move', mode: '5 min walk' });
		expect(noteEntry().kind).toBe('note');
		expect(location({ label: undefined })).not.toHaveProperty('label');
		expect(placeStop({ stop: 'Only' }).locations.length).toBeGreaterThan(0);
		expect(task({ id: 'x', points: 3 })).toMatchObject({ id: 'x', points: 3 });
		expect(link({ label: 'Tickets' }).url).toMatch(/^https:\/\//);
	});
});

describe('buildCrawl', () => {
	it('builds a resolved crawl with the given id', () => {
		const crawl = buildCrawl('lantern-loop', { color: 'amber' });
		expect(crawl).toMatchObject({ id: 'lantern-loop', color: 'amber', title: buildRecord().title });
		expect(crawl.definition).toEqual(buildDefinition());
	});
});
