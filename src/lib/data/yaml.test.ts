import { expect, it } from 'vitest';
import { parseJsonYaml } from './yaml.js';

it('rejects malformed YAML syntax', () => {
	expect(() => parseJsonYaml('title: [unfinished')).toThrow(/YAML/i);
});

it('rejects non-finite numbers', () => {
	expect(() => parseJsonYaml('points: .inf')).toThrow(/JSON-clean/i);
});
