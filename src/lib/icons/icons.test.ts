import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// The Bold preset from icon-set-generator. The test holds these values itself,
// so a drifting style-spec.json cannot loosen the gate.
const BOLD = {
	preset: 'bold',
	grid: 24,
	strokeWidth: 2.5,
	strokeLinecap: 'round',
	strokeLinejoin: 'round',
};
const SHELL_ICONS = ['checklist', 'clock', 'info', 'map-pin', 'train'];

const SVG_NS = 'http://www.w3.org/2000/svg';
const ELEMENTS = new Set(['svg', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon']);
const ROOT_ATTRIBUTES = new Set([
	'xmlns', 'width', 'height', 'viewBox', 'fill', 'stroke',
	'stroke-width', 'stroke-linecap', 'stroke-linejoin',
]);
const CHILD_ATTRIBUTES = new Set([
	'fill', 'stroke', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y',
	'width', 'height', 'x1', 'y1', 'x2', 'y2', 'points',
]);
const PAINT_VALUES = new Set(['none', 'currentColor']);

const directory = resolve('src/lib/icons');
const files = readdirSync(directory).filter((file) => file.endsWith('.svg')).sort();
const spec = JSON.parse(readFileSync(resolve(directory, 'style-spec.json'), 'utf8'));

function parse(file: string): Document {
	const source = readFileSync(resolve(directory, file), 'utf8');
	return new DOMParser().parseFromString(source, 'image/svg+xml');
}

describe('icon set', () => {
	it('holds the five shell icons, and the style spec lists exactly the files', () => {
		const names = files.map((file) => file.replace(/\.svg$/, ''));
		expect(names).toEqual(expect.arrayContaining(SHELL_ICONS));
		expect([...spec.icons].sort()).toEqual(names);
		for (const name of names) expect(name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
	});

	it('records the Bold preset in the style spec', () => {
		expect(spec).toMatchObject(BOLD);
	});
});

describe.each(files)('%s', (file) => {
	const document = parse(file);
	const root = document.documentElement;
	const elements = [root, ...Array.from(root.querySelectorAll('*'))];

	it('parses without error', () => {
		expect(document.getElementsByTagName('parsererror')).toHaveLength(0);
		expect(root.localName).toBe('svg');
	});

	it('uses the Bold root attributes', () => {
		expect(root.getAttribute('viewBox')).toBe(`0 0 ${BOLD.grid} ${BOLD.grid}`);
		expect(root.getAttribute('stroke-width')).toBe(String(BOLD.strokeWidth));
		expect(root.getAttribute('stroke-linecap')).toBe(BOLD.strokeLinecap);
		expect(root.getAttribute('stroke-linejoin')).toBe(BOLD.strokeLinejoin);
	});

	it('uses only allowed SVG elements', () => {
		for (const element of elements) {
			expect(element.namespaceURI, element.localName).toBe(SVG_NS);
			expect(ELEMENTS.has(element.localName), element.localName).toBe(true);
		}
	});

	it('uses only allowed attributes, and no child overrides the stroke style', () => {
		for (const element of elements) {
			const allowed = element === root ? ROOT_ATTRIBUTES : CHILD_ATTRIBUTES;
			for (const attribute of Array.from(element.attributes)) {
				expect(allowed.has(attribute.name), `${element.localName} ${attribute.name}`).toBe(true);
			}
		}
	});

	it('paints only with none or currentColor', () => {
		for (const element of elements) {
			for (const name of ['fill', 'stroke']) {
				const value = element.getAttribute(name);
				if (value !== null) expect(PAINT_VALUES.has(value), `${element.localName} ${name}="${value}"`).toBe(true);
			}
		}
	});

	it('uses at most two decimal places', () => {
		for (const element of elements) {
			for (const attribute of Array.from(element.attributes)) {
				for (const fraction of attribute.value.match(/\.\d+/g) ?? []) {
					expect(fraction.length - 1, `${attribute.name}="${attribute.value}"`).toBeLessThanOrEqual(2);
				}
			}
		}
	});
});
