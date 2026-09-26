import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { defaultCrawl } from '$lib/config.js';

it('passes the app setting from the root route to the shell', () => {
	const source = readFileSync(resolve('src/routes/+page.svelte'), 'utf8');
	expect(source).toMatch(/import \{ defaultCrawl \} from ['"]\$lib\/config\.js['"]/);
	expect(source).toMatch(/<Shell id=\{defaultCrawl\} \/>/);
	for (const quote of ["'", '"', '`']) expect(source).not.toContain(`${quote}${defaultCrawl}${quote}`);
});
