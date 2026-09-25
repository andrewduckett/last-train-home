import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import expectedDefinition from '../../../tests/fixtures/cory-trent.json';
import { parseJsonYaml } from './yaml.js';

it('preserves every authored seed value in YAML', () => {
	const source = readFileSync(resolve('static/crawls/cory-trent.yaml'), 'utf8');
	expect(parseJsonYaml(source)).toEqual({
		title: 'Cory & Trent: Last Train Home',
		color: 'amber',
		definition: expectedDefinition,
	});
});
