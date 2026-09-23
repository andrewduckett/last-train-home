import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { defaultCrawl } from './config.js';
import { getCrawl } from './data/provider.js';
import Shell from './Shell.svelte';
import CrawlRoute from './CrawlRoute.svelte';

afterEach(() => vi.unstubAllGlobals());

it.each(['/', '/cory-trent'])('%s selects the authored amber palette', async (path) => {
	const source = readFileSync(resolve('static/crawls/cory-trent.yaml'), 'utf8');
	vi.stubGlobal('fetch', async () => ({
		ok: true, status: 200, headers: { get: () => 'application/yaml' }, text: async () => source,
	}));
	const id = path === '/' ? defaultCrawl : path.slice(1);
	const rendered = path === '/' ? render(Shell, { id, getCrawl }) : render(CrawlRoute, { id, getCrawl });
	await screen.findByTestId('view-schedule');
	expect(rendered.container.querySelector('.shell')).toHaveAttribute('data-palette', 'amber');
});
