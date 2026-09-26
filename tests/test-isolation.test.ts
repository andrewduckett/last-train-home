// Keeps tests from coupling to authored crawls again. Only the contract tests
// may read authored crawl files, and no test may name an authored crawl's id.
// A test that needs a crawl builds one with tests/fixtures/crawl-builders.ts.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const CONTRACT_FILES = new Set([
	'tests/authored-crawls.test.ts',
	'tests/static-build.test.ts',
	'tests/fixtures/authored-crawls.ts',
]);
const AUTHORED_PATHS = ['static/crawls', 'build/crawls'];
const SELF = 'tests/test-isolation.test.ts';

interface SourceFile {
	path: string;
	text: string;
}

function escape(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Returns one message per coupling found, naming the file and the fix. */
export function findCoupling(files: SourceFile[], authoredIds: string[]): string[] {
	const problems: string[] = [];
	for (const { path, text } of files) {
		if (path === SELF) continue;
		if (!CONTRACT_FILES.has(path)) {
			for (const authored of AUTHORED_PATHS) {
				if (text.includes(authored)) problems.push(`${path} reads ${authored}; build a crawl with tests/fixtures/crawl-builders.ts`);
			}
		}
		for (const id of authoredIds) {
			if (new RegExp(`['"\`/:]${escape(id)}(?![\\w-])`).test(text)) {
				problems.push(`${path} names the authored crawl "${id}"; import defaultCrawl or build a crawl instead`);
			}
		}
	}
	return problems;
}

function testSources(): SourceFile[] {
	const paths = [
		...readdirSync(resolve('src'), { recursive: true, encoding: 'utf8' }).map((file) => join('src', file)),
		...readdirSync(resolve('tests'), { recursive: true, encoding: 'utf8' }).map((file) => join('tests', file)),
	].filter((path) => /\.test\.(ts|svelte)$/.test(path) || (path.startsWith('tests/fixtures/') && /\.(ts|js|json|ya?ml)$/.test(path)));
	return paths.map((path) => ({ path: relative('.', path), text: readFileSync(resolve(path), 'utf8') }));
}

function authoredIds(): string[] {
	return readdirSync(resolve('static/crawls')).filter((name) => name.endsWith('.yaml')).map((name) => name.replace(/\.yaml$/, ''));
}

it('finds no test coupled to an authored crawl', () => {
	expect(authoredIds().length).toBeGreaterThan(0);
	expect(findCoupling(testSources(), authoredIds())).toEqual([]);
});

describe('findCoupling', () => {
	const ids = ['harbor-night'];

	it('flags a test that reads authored crawl files', () => {
		const problems = findCoupling([{ path: 'src/lib/x.test.ts', text: "readFileSync('static/crawls/a.yaml')" }], ids);
		expect(problems).toEqual([expect.stringMatching(/^src\/lib\/x\.test\.ts reads static\/crawls/)]);
	});

	it('flags a test that reads built crawl files', () => {
		expect(findCoupling([{ path: 'tests/y.test.ts', text: "resolve('build/crawls')" }], ids)).toHaveLength(1);
	});

	it('lets the contract files read authored crawls', () => {
		const files = [...CONTRACT_FILES].map((path) => ({ path, text: "resolve('static/crawls'); resolve('build/crawls')" }));
		expect(findCoupling(files, ids)).toEqual([]);
	});

	it.each([`'harbor-night'`, `"harbor-night"`, '`harbor-night`', '/harbor-night', "'crawl-checks:harbor-night'"])(
		'flags an authored id written as %s',
		(text) => {
			expect(findCoupling([{ path: 'tests/fixtures/z.ts', text }], ids)).toEqual([
				expect.stringContaining('names the authored crawl "harbor-night"'),
			]);
		},
	);

	it('flags an authored id even in a contract file', () => {
		expect(findCoupling([{ path: 'tests/authored-crawls.test.ts', text: "'harbor-night'" }], ids)).toHaveLength(1);
	});

	it('ignores an id that only appears inside a longer word or id', () => {
		const text = "const harborNight = 1; 'harbor-nightfall'; 'old-harbor-night-x'";
		expect(findCoupling([{ path: 'tests/w.test.ts', text }], ids)).toEqual([]);
	});

	it('skips its own source', () => {
		expect(findCoupling([{ path: SELF, text: "'static/crawls' 'harbor-night'" }], ids)).toEqual([]);
	});
});
