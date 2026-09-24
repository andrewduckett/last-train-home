import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { palettes, textPairs, boundaryPairs } from './palette.mjs';
import { generateCss } from '../../../scripts/generate-palette.mjs';

const output = resolve('src/lib/theme/generated.css');

function luminance(hex: string): number {
	const channels = hex.match(/[0-9a-f]{2}/gi)!.map((part) => {
		const c = parseInt(part, 16) / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(a: string, b: string): number {
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (light + 0.05) / (dark + 0.05);
}

function emittedPalettes(css: string) {
	const blocks = [...css.matchAll(/(?:^|\n)\s*(:root|\.shell\[data-palette="(amber|teal)"\]) \{([^}]+)\}/g)];
	expect(blocks).toHaveLength(6);
	return Object.fromEntries(['light', 'dark'].map((scheme, i) => [scheme, Object.fromEntries(
		blocks.slice(i * 3, i * 3 + 3).map((block) => [block[2] ?? 'neutral', Object.fromEntries(
			[...block[3].matchAll(/--([\w-]+): ([^;]+);/g)].map((match) => [match[1], match[2]]),
		)]),
	)]));
}

it('emits every palette token in both schemes and matches the source', () => {
	const css = readFileSync(output, 'utf8');
	const emitted = emittedPalettes(css);
	for (const scheme of ['light', 'dark'] as const) {
		for (const [name, tokens] of Object.entries(palettes[scheme])) {
			expect(emitted[scheme][name]).toEqual(tokens);
		}
	}
	expect(css).toBe(generateCss());
});

it('rejects stale generated output', () => {
	const original = readFileSync(output, 'utf8');
	expect(`${original}\n/* stale */\n`).not.toBe(generateCss());
});

it('passes declared text and control contrast in every emitted palette', () => {
	const css = readFileSync(output, 'utf8');
	const emitted = emittedPalettes(css);
	for (const scheme of ['light', 'dark'] as const) {
		for (const [name, tokens] of Object.entries(emitted[scheme])) {
			for (const [foreground, background, minimum] of textPairs) {
				expect(contrast(tokens[foreground], tokens[background]), `${scheme}/${name}: ${foreground} on ${background}`).toBeGreaterThanOrEqual(minimum);
			}
			for (const [foreground, background] of boundaryPairs) {
				expect(contrast(tokens[foreground], tokens[background]), `${scheme}/${name}: ${foreground} against ${background}`).toBeGreaterThanOrEqual(3);
			}
			for (const [key, value] of Object.entries(tokens)) expect(css).toContain(`--${key}: ${value};`);
		}
	}
});

it('shares page, content, board, and success colors across palettes', () => {
	const emitted = emittedPalettes(readFileSync(output, 'utf8'));
	for (const scheme of ['light', 'dark'] as const) {
		for (const token of ['bg', 'surface', 'board', 'board-2', 'good', 'on-good']) {
			expect(emitted[scheme].amber[token]).toBe(emitted[scheme].neutral[token]);
			expect(emitted[scheme].teal[token]).toBe(emitted[scheme].neutral[token]);
		}
	}
});
