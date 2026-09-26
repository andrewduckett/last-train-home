import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { defaultCrawl } from './config.js';
import Shell from './Shell.svelte';
import CrawlRoute from './CrawlRoute.svelte';
import { buildRecord } from '../../tests/fixtures/crawl-builders.js';
import { recordProvider } from '../../tests/fixtures/crawl-provider.js';

it.each(['root', 'direct'])('the %s path selects the default crawl\'s authored palette', async (path) => {
	const { getCrawl } = recordProvider({ [defaultCrawl]: buildRecord({ color: 'teal' }) });
	const rendered = path === 'root'
		? render(Shell, { id: defaultCrawl, getCrawl })
		: render(CrawlRoute, { id: defaultCrawl, getCrawl });
	await screen.findByTestId('view-schedule');
	expect(rendered.container.querySelector('.shell')).toHaveAttribute('data-palette', 'teal');
});
