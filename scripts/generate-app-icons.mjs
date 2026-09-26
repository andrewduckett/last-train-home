import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { palettes } from '../src/lib/theme/palette.mjs';

// The board colors are the same in every palette and scheme.
const BOARD = palettes.light.neutral.board;
const BOARD_INK = palettes.light.neutral['board-ink'];

const root = fileURLToPath(new URL('..', import.meta.url));
const TRAIN = readFileSync(resolve(root, 'src/lib/icons/train.svg'), 'utf8').trim();

/** The PNG app icons. `train` is the share of the icon width the train fills. */
export const PNG_ICONS = [
	{ path: 'static/apple-touch-icon.png', size: 180, train: 0.6 },
	{ path: 'static/icons/icon-192.png', size: 192, train: 0.6 },
	{ path: 'static/icons/icon-512.png', size: 512, train: 0.6 },
	// Android crops a maskable icon to a circle 80% wide, so the train stays inside it.
	{ path: 'static/icons/icon-maskable-512.png', size: 512, train: 0.5 },
];

/** @param {{ size: number, train: number, radius?: number }} options */
export function appIconSvg({ size, train, radius = 0 }) {
	const width = size * train;
	const offset = (size - width) / 2;
	const nested = TRAIN
		.replace(/ xmlns="[^"]*"/, '')
		.replace('width="24" height="24"', `x="${offset}" y="${offset}" width="${width}" height="${width}"`)
		.replaceAll('currentColor', BOARD_INK);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">\n`
		+ `<rect width="${size}" height="${size}" rx="${radius}" fill="${BOARD}"/>\n${nested}\n</svg>\n`;
}

function manifest() {
	const icons = [
		{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
		{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
		{ src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
	];
	// No start_url: the browser uses the page the Crawler added, so the icon opens that crawl.
	return `${JSON.stringify({
		name: 'Last Train Home',
		short_name: 'Last Train',
		display: 'standalone',
		theme_color: BOARD,
		background_color: BOARD,
		icons,
	}, null, '\t')}\n`;
}

/** @returns {Map<string, Buffer | string>} each output path, relative to the repo root, and its content */
export function generateAppIcons() {
	const outputs = new Map();
	for (const { path, size, train } of PNG_ICONS) {
		outputs.set(path, new Resvg(appIconSvg({ size, train })).render().asPng());
	}
	outputs.set('static/favicon.svg', appIconSvg({ size: 32, train: 0.75, radius: 6 }));
	outputs.set('static/manifest.webmanifest', manifest());
	return outputs;
}

if (import.meta.url.startsWith('file:') && process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const outputs = generateAppIcons();
	if (process.argv.includes('--check')) {
		const stale = [...outputs].filter(([path, content]) => {
			const file = resolve(root, path);
			return !existsSync(file) || !readFileSync(file).equals(Buffer.from(content));
		});
		for (const [path] of stale) console.error(`App icon file is stale: ${path}. Run npm run generate:icons.`);
		if (stale.length > 0) process.exitCode = 1;
	} else {
		for (const [path, content] of outputs) {
			const file = resolve(root, path);
			mkdirSync(dirname(file), { recursive: true });
			writeFileSync(file, content);
		}
	}
}
