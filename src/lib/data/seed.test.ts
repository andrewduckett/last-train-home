import { expect, it } from 'vitest';
import expectedDefinition from '../../../tests/fixtures/cory-trent.json';
import { getCrawl } from './provider.js';

it('resolves the original seed content through the production provider', async () => {
	await expect(getCrawl('cory-trent')).resolves.toEqual({
		status: 'found',
		crawl: { id: 'cory-trent', title: 'Last Train Home', definition: expectedDefinition },
	});
});

it.each(['missing', '', 'constructor', 'toString', '__proto__', 'hasOwnProperty'])('does not resolve unknown id %j', async (id) => {
	await expect(getCrawl(id)).resolves.toEqual({ status: 'not-found', id });
});
