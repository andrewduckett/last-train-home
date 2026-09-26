import { expect, it } from 'vitest';
import { stringify } from 'yaml';
import { validateCrawlSource } from './validate.js';

function source(change: (definition: Record<string, any>) => void = () => {}) {
	const definition: Record<string, any> = {
		appTitle: 'Walk', line: 'Park → Cafe',
		schedule: [{ kind: 'move', time: 'Noon', title: 'To cafe', mode: '15 min walk' }],
		links: [],
		places: [{ stop: 'Cafe', town: 'Town', locations: [{ name: 'Cafe', address: '1 Main' }] }],
		scavenger: [{ id: 'photo', title: 'Photo', points: 10, description: 'Share it' }], scavengerRules: ['Share.'],
	};
	change(definition);
	return stringify({ title: 'Walk', definition });
}

it('accepts a walking move and an empty link list', () => {
	expect(() => validateCrawlSource('walk.yaml', source())).not.toThrow();
});

it('accepts an album through the quick-link list', () => {
	expect(() => validateCrawlSource('walk.yaml', source((definition) => {
		definition.links = [{ label: 'Group album', url: 'https://example.com/album' }];
	}))).not.toThrow();
});

it('rejects an unsafe album quick link', () => {
	expect(() => validateCrawlSource('walk.yaml', source((definition) => {
		definition.links = [{ label: 'Group album', url: 'javascript:alert(1)' }];
	}))).toThrow('walk.yaml: invalid definition.links[0].url');
});

it.each([
	['schedule[0].kind', (d: any) => { d.schedule[0].kind = 'depart'; }],
	['schedule[0].time', (d: any) => { d.schedule[0].time = ''; }],
	['schedule[0].title', (d: any) => { d.schedule[0].title = ' '; }],
	['schedule[0].mode', (d: any) => { delete d.schedule[0].mode; }],
	['schedule[0].tag', (d: any) => { d.schedule[0].tag = ''; }],
	['schedule[0].note', (d: any) => { d.schedule[0].note = ''; }],
	['links[0].label', (d: any) => { d.links = [{ label: '', url: 'https://example.com' }]; }],
	['links[0].url', (d: any) => { d.links = [{ label: 'Bad', url: 'javascript:alert(1)' }]; }],
	['schedule', (d: any) => { delete d.schedule; }],
	['links', (d: any) => { delete d.links; }],
] as const)('identifies invalid definition.%s', (field, change) => {
	expect(() => validateCrawlSource('walk.yaml', source(change))).toThrow(`walk.yaml: invalid definition.${field}`);
});
