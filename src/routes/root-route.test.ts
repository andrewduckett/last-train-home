import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { defaultCrawl } from '$lib/config.js';

it('configures cory-trent as the default crawl', () => {
	expect(defaultCrawl).toBe('cory-trent');
});

it('passes the app setting from the root route to the shell', () => {
	const source = readFileSync(resolve('src/routes/+page.svelte'), 'utf8');
	expect(source).toMatch(/import \{ defaultCrawl \} from ['"]\$lib\/config\.js['"]/);
	expect(source).toMatch(/<Shell id=\{defaultCrawl\} \/>/);
	expect(source).not.toContain('cory-trent');
});
