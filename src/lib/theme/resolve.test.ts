import { expect, it } from 'vitest';
import { resolvePalette } from './resolve.js';

it.each([
	['amber', 'amber'],
	['teal', 'teal'],
	[undefined, 'neutral'],
	['unknown', 'neutral'],
	['Amber', 'neutral'],
	['TEAL', 'neutral'],
])('resolves %s to %s without rejecting the crawl', (authored, expected) => {
	expect(resolvePalette(authored)).toBe(expected);
});
