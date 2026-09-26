import { expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateCrawlDirectory, validateCrawlSource } from './validate.js';

const validSource = `
title: Example
definition:
  appTitle: Example
  line: A → B
  schedule:
    - time: Noon
      kind: stop
      tag: Meet
      title: First stop
  places:
    - stop: Stop 1
      town: Town
      locations:
        - name: Cafe
          address: 1 Main St
  scavenger:
    - id: photo
      title: Take a photo
      points: 10
      description: Share it
  scavengerRules:
    - Post the photo.
  links: []
`;

it('accepts an omitted introduction', () => {
	expect(() => validateCrawlSource('example.yaml', validSource)).not.toThrow();
});

it('accepts a Unicode introduction', () => {
	expect(() => validateCrawlSource('example.yaml', validSource.replace('  line: A → B\n', '  line: A → B\n  intro: Welcome 🚆!\n'))).not.toThrow();
});

it.each(['   ', 42, '[welcome]', '{ greeting: hello }'])(
	'rejects invalid introduction %j', (intro) => {
		const source = validSource.replace('  line: A → B\n', `  line: A → B\n  intro: ${intro}\n`);
		expect(() => validateCrawlSource('example.yaml', source)).toThrow(/example\.yaml: invalid definition\.intro/);
	},
);

it('accepts a crawl without a map', () => {
	expect(() => validateCrawlSource('example.yaml', validSource)).not.toThrow();
});

it('rejects a leftover map and says to link a route map', () => {
	const source = validSource + '  map:\n    app: https://www.google.com/maps/d/viewer?mid=example\n';
	expect(() => validateCrawlSource('example.yaml', source)).toThrow(
		'example.yaml: invalid definition.map (removed; link a route map from links)',
	);
});

it('rejects the obsolete album field', () => {
	expect(() => validateCrawlSource('example.yaml', validSource + '  albumUrl: https://example.com/photos\n')).toThrow(/example\.yaml: invalid definition\.albumUrl/);
});

it.each(['BadName.yaml', 'bad_name.yaml', 'bad--name.yaml', '-bad.yaml', 'bad-.yaml'])(
	'rejects invalid filename %s',
	(fileName) => {
		expect(() => validateCrawlSource(fileName, 'title: Example\ndefinition: {}')).toThrow(
			new RegExp(`${fileName.replace('.', '\\.')}.*filename`, 'i'),
		);
	},
);

it('identifies a definition field with the wrong type', () => {
	const source = validSource.replace('  schedule:\n    -', '  schedule: not-a-list\n  ignored:\n    -');
	expect(() => validateCrawlSource('example.yaml', source)).toThrow(
		/example\.yaml.*definition\.schedule/i,
	);
});

it.each([
	['appTitle', '  appTitle: Example\n'],
	['line', '  line: A → B\n'],
])('identifies an invalid definition.%s type', (field, authoredLine) => {
	const source = validSource.replace(authoredLine, `  ${field}: 42\n`);
	expect(() => validateCrawlSource('example.yaml', source)).toThrow(
		new RegExp(`example\\.yaml.*definition\\.${field}`, 'i'),
	);
});

it.each([
	['definition.schedule[0].kind', '      kind: stop\n'],
	['definition.schedule[0].tag', '      tag: Meet\n'],
	['definition.schedule[0].title', '      title: First stop\n'],
	['definition.places[0].stop', '    - stop: Stop 1\n'],
	['definition.places[0].town', '      town: Town\n'],
	['definition.places[0].locations[0].name', '        - name: Cafe\n'],
	['definition.places[0].locations[0].address', '          address: 1 Main St\n'],
	['definition.scavenger[0].title', '      title: Take a photo\n'],
	['definition.scavenger[0].description', '      description: Share it\n'],
])('identifies an invalid %s type', (field, authoredLine) => {
	const source = validSource.replace(authoredLine, authoredLine.replace(/:.*/, ': 42'));
	expect(() => validateCrawlSource('example.yaml', source)).toThrow(
		new RegExp(`example\\.yaml.*${field.replaceAll('.', '\\.').replaceAll('[', '\\[').replaceAll(']', '\\]')}`, 'i'),
	);
});

it.each([
	['definition.places[0].locations[0].n', 'name', '          address: 1 Main St\n', '          n: Cafe\n'],
	['definition.places[0].locations[0].a', 'address', '          address: 1 Main St\n', '          a: 1 Main St\n'],
	['definition.scavenger[0].t', 'title', '      points: 10\n', '      t: Take a photo\n'],
	['definition.scavenger[0].p', 'points', '      points: 10\n', '      p: 10\n'],
	['definition.scavenger[0].d', 'description', '      points: 10\n', '      d: Share it\n'],
])('rejects the retired key %s and names %s', (field, replacement, authoredLine, retiredLine) => {
	const source = validSource.replace(authoredLine, authoredLine + retiredLine);
	expect(() => validateCrawlSource('example.yaml', source)).toThrow(
		`example.yaml: invalid ${field} (renamed to ${replacement})`,
	);
});

it('rejects the retired venues list and names places', () => {
	const source = validSource.replace('  places:\n    - stop: Stop 1\n', '  venues: []\n  places:\n    - stop: Stop 1\n');
	expect(() => validateCrawlSource('example.yaml', source)).toThrow(
		'example.yaml: invalid definition.venues (renamed to places)',
	);
});

it('rejects a stop that keeps its old places list and names locations', () => {
	const source = validSource.replace('      town: Town\n', '      town: Town\n      places: []\n');
	expect(() => validateCrawlSource('example.yaml', source)).toThrow(
		'example.yaml: invalid definition.places[0].places (renamed to locations)',
	);
});

it.each([
	['empty', '      locations: []\n'],
	['missing', ''],
])('rejects a stop whose locations list is %s', (_case, replacement) => {
	const source = validSource.replace('      locations:\n        - name: Cafe\n          address: 1 Main St\n', replacement);
	expect(() => validateCrawlSource('example.yaml', source)).toThrow(
		'example.yaml: invalid definition.places[0].locations',
	);
});

it('accepts an empty places list', () => {
	const source = validSource.replace(
		'  places:\n    - stop: Stop 1\n      town: Town\n      locations:\n        - name: Cafe\n          address: 1 Main St\n',
		'  places: []\n',
	);
	expect(() => validateCrawlSource('example.yaml', source)).not.toThrow();
});

it('accepts a location label', () => {
	const source = validSource.replace('          address: 1 Main St\n', '          address: 1 Main St\n          label: Train\n');
	expect(() => validateCrawlSource('example.yaml', source)).not.toThrow();
});

it.each(['"   "', '42', '[Train]', '{ kind: Train }'])('rejects the location label %s', (label) => {
	const source = validSource.replace('          address: 1 Main St\n', `          address: 1 Main St\n          label: ${label}\n`);
	expect(() => validateCrawlSource('example.yaml', source)).toThrow(
		'example.yaml: invalid definition.places[0].locations[0].label',
	);
});

it('identifies a non-numeric scavenger points value', () => {
	const source = validSource.replace('      points: 10\n', '      points: ten\n');
	expect(() => validateCrawlSource('example.yaml', source)).toThrow(
		'example.yaml: invalid definition.scavenger[0].points',
	);
});

it('identifies an invalid schedule time type', () => {
	const source = validSource.replace('    - time: Noon\n', '    - time: 42\n');
	expect(() => validateCrawlSource('example.yaml', source)).toThrow(
		/example\.yaml.*definition\.schedule\[0\]\.time/i,
	);
});

it('rejects a non-string scavenger rule', () => {
	const source = validSource.replace('    - Post the photo.\n', '    - 42\n');
	expect(() => validateCrawlSource('example.yaml', source)).toThrow(
		/example\.yaml.*definition\.scavengerRules\[0\]/i,
	);
});

it('rejects duplicate stop labels', () => {
	const source = validSource.replace(
		'  scavenger:\n',
		'    - stop: Stop 1\n      town: Another Town\n      locations:\n        - name: Pub\n          address: 2 Main St\n  scavenger:\n',
	);
	expect(() => validateCrawlSource('example.yaml', source)).toThrow(
		/example\.yaml: invalid definition\.places\.stop duplicate/,
	);
});

it('rejects duplicate location names within a stop', () => {
	const source = validSource.replace(
		'          address: 1 Main St\n',
		'          address: 1 Main St\n        - name: Cafe\n          address: 2 Main St\n',
	);
	expect(() => validateCrawlSource('example.yaml', source)).toThrow(
		/example\.yaml: invalid definition\.places\[0\]\.locations\.name duplicate/,
	);
});

it('rejects duplicate scavenger task ids', () => {
	const source = validSource.replace(
		'  scavengerRules:\n',
		'    - id: photo\n      title: Another photo\n      points: 5\n      description: Share another\n  scavengerRules:\n',
	);
	expect(() => validateCrawlSource('example.yaml', source)).toThrow(
		/example\.yaml.*definition\.scavenger.*id/i,
	);
});

it('rejects a non-positive scavenger point total', () => {
	const source = validSource.replace('      points: 10\n', '      points: 0\n');
	expect(() => validateCrawlSource('example.yaml', source)).toThrow(
		/example\.yaml: invalid definition\.scavenger\.points total/,
	);
});

it('validates every YAML file in the crawl directory', () => {
	mkdirSync(resolve('.workspace'), { recursive: true });
	const directory = mkdtempSync(resolve('.workspace/crawls-'));
	try {
		writeFileSync(resolve(directory, 'example.yaml'), validSource);
		writeFileSync(resolve(directory, 'broken.yaml'), 'title: [unfinished');
		expect(() => validateCrawlDirectory(directory)).toThrow(/broken\.yaml.*YAML/i);
	} finally {
		rmSync(directory, { recursive: true });
	}
});
