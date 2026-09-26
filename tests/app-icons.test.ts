// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { palettes } from '../src/lib/theme/palette.mjs';
import { appIconSvg, generateAppIcons, PNG_ICONS } from '../scripts/generate-app-icons.mjs';

const BOARD = palettes.light.neutral.board;
const BOARD_INK = palettes.light.neutral['board-ink'];
const EMOJI = /\p{Extended_Pictographic}/u;

const outputs = generateAppIcons();
const manifest = JSON.parse(String(outputs.get('static/manifest.webmanifest')));

function pngSize(png: Buffer): [number, number] {
	return [png.readUInt32BE(16), png.readUInt32BE(20)];
}

function hex(pixels: Uint8Array, offset: number): string {
	return `#${Array.from(pixels.subarray(offset, offset + 3), (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

describe('app icon generator', () => {
	it('produces the six outputs', () => {
		expect([...outputs.keys()].sort()).toEqual([
			'static/apple-touch-icon.png',
			'static/favicon.svg',
			'static/icons/icon-192.png',
			'static/icons/icon-512.png',
			'static/icons/icon-maskable-512.png',
			'static/manifest.webmanifest',
		]);
	});

	it('writes a full-screen manifest with board colors and no start_url', () => {
		expect(manifest).toMatchObject({
			name: 'Last Train Home',
			short_name: 'Last Train',
			display: 'standalone',
			theme_color: BOARD,
			background_color: BOARD,
		});
		expect(manifest).not.toHaveProperty('start_url');
	});

	it('lists 192, 512, and maskable 512 icons at their real sizes', () => {
		expect(manifest.icons).toEqual([
			{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
			{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
			{ src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
		]);
		for (const icon of manifest.icons) {
			const png = outputs.get(`static${icon.src}`) as Buffer;
			expect(pngSize(png).join('x'), icon.src).toBe(icon.sizes);
		}
		expect(pngSize(outputs.get('static/apple-touch-icon.png') as Buffer)).toEqual([180, 180]);
	});

	it.each(PNG_ICONS)('renders $path opaque, with a board-colored corner', ({ size, train }) => {
		const { pixels } = new Resvg(appIconSvg({ size, train })).render();
		for (let alpha = 3; alpha < pixels.length; alpha += 4) {
			if (pixels[alpha] !== 255) throw new Error(`transparent pixel at byte ${alpha}`);
		}
		expect(hex(pixels, 0)).toBe(BOARD);
	});

	it('draws the favicon in board colors, with no emoji', () => {
		const favicon = String(outputs.get('static/favicon.svg'));
		expect(favicon).toContain(`fill="${BOARD}"`);
		expect(favicon).toContain(`stroke="${BOARD_INK}"`);
		expect(favicon).not.toContain('currentColor');
		expect(favicon).not.toMatch(EMOJI);
	});

	it.each([...outputs.keys()])('keeps %s current with its sources', (path) => {
		const file = resolve(path);
		expect(existsSync(file), `${path} is missing; run npm run generate:icons`).toBe(true);
		const expected = outputs.get(path)!;
		const actual = readFileSync(file);
		expect(actual.equals(Buffer.from(expected)), `${path} is stale; run npm run generate:icons`).toBe(true);
	});
});

describe('page head', () => {
	const head = readFileSync(resolve('src/app.html'), 'utf8');

	it('links the manifest and the Apple touch icon', () => {
		expect(head).toContain('<link rel="manifest" href="%sveltekit.assets%/manifest.webmanifest" />');
		expect(head).toContain('<link rel="apple-touch-icon" href="%sveltekit.assets%/apple-touch-icon.png" />');
	});

	it('shows the header under the iOS status bar and names the app', () => {
		expect(head).toContain('<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />');
		expect(head).toContain('<meta name="apple-mobile-web-app-title" content="Last Train" />');
	});

	it('sets theme-color to the palette board color', () => {
		const themeColor = head.match(/<meta name="theme-color" content="([^"]+)"/)?.[1];
		expect(themeColor?.toLowerCase()).toBe(BOARD);
	});
});
