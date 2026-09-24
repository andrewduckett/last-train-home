import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const paletteSource = resolve('src/lib/theme/palette.mjs');

function regeneratePaletteOnChange() {
	return {
		name: 'regenerate-palette-on-change',
		configureServer(server: { watcher: { on(event: string, callback: (path: string) => void): void } }) {
			server.watcher.on('change', (path) => {
				if (resolve(path) === paletteSource) {
					execFileSync(process.execPath, [resolve('scripts/generate-palette.mjs')]);
				}
			});
		},
	};
}

export default defineConfig({
	plugins: [regeneratePaletteOnChange(), sveltekit()],
});
