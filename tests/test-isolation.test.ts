// Keeps tests from coupling to authored crawls again. Only the contract tests
// may read authored crawl files. A test that needs a crawl builds one with
// tests/fixtures/crawl-builders.ts. The guard does not ban authored ids: a
// crawl added later could share a name with an id a test invents.
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

/** Returns one message per coupling found, naming the file and the fix. */
export function findCoupling(files: SourceFile[]): string[] {
	const problems: string[] = [];
	for (const { path, text } of files) {
		if (path === SELF) continue;
		if (CONTRACT_FILES.has(path)) continue;
		for (const authored of AUTHORED_PATHS) {
			if (text.includes(authored)) problems.push(`${path} reads ${authored}; build a crawl with tests/fixtures/crawl-builders.ts`);
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

it('finds no test coupled to an authored crawl', () => {
	expect(findCoupling(testSources())).toEqual([]);
});

describe('findCoupling', () => {
	it('flags a test that reads authored crawl files', () => {
		const problems = findCoupling([{ path: 'src/lib/x.test.ts', text: "readFileSync('static/crawls/a.yaml')" }]);
		expect(problems).toEqual([expect.stringMatching(/^src\/lib\/x\.test\.ts reads static\/crawls/)]);
	});

	it('flags a test that reads built crawl files', () => {
		expect(findCoupling([{ path: 'tests/y.test.ts', text: "resolve('build/crawls')" }])).toHaveLength(1);
	});

	it('lets the contract files read authored crawls', () => {
		const files = [...CONTRACT_FILES].map((path) => ({ path, text: "resolve('static/crawls'); resolve('build/crawls')" }));
		expect(findCoupling(files)).toEqual([]);
	});

	it('skips its own source', () => {
		expect(findCoupling([{ path: SELF, text: "'static/crawls'" }])).toEqual([]);
	});
});
