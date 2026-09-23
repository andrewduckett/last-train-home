import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

function headerBlocks() {
	const source = readFileSync(resolve('static/_headers'), 'utf8');
	return source.trim().split(/\n(?=\/)/).map((block) => {
		const [path, ...headers] = block.split('\n');
		return { path: path.trim(), headers: headers.map((line) => line.trim()) };
	});
}

it('requires YAML crawl records to revalidate', () => {
	const crawlBlock = headerBlocks().find((block) => block.path === '/crawls/*.yaml');
	expect(crawlBlock?.headers).toContain('Cache-Control: no-cache');
});

it('limits the revalidation policy to crawl records', () => {
	const otherBlocks = headerBlocks().filter((block) => block.path !== '/crawls/*.yaml');
	expect(otherBlocks.flatMap((block) => block.headers)).not.toContain('Cache-Control: no-cache');
});
