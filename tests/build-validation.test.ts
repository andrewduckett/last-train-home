import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { expect, it } from 'vitest';

it('stops the production build when a crawl is invalid', () => {
	mkdirSync(resolve('.workspace'), { recursive: true });
	const directory = mkdtempSync(resolve('.workspace/invalid-build-crawls-'));
	try {
		writeFileSync(resolve(directory, 'broken.yaml'), 'title: [unfinished');
		const result = spawnSync('npm', ['run', 'build'], {
			cwd: process.cwd(),
			encoding: 'utf8',
			env: { ...process.env, CRAWLS_DIR: directory },
		});
		expect(result.status).not.toBe(0);
		expect(`${result.stdout}\n${result.stderr}`).toMatch(/broken\.yaml.*YAML/i);
	} finally {
		rmSync(directory, { recursive: true });
	}
});
