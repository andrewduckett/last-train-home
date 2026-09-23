import { createCrawlProvider } from '../../src/lib/data/provider.js';
import { crawl } from './cory-trent.js';

const source = { title: crawl.appTitle, definition: crawl };

export const seedShellProps = {
	id: 'cory-trent',
	getCrawl: createCrawlProvider(() => source).getCrawl,
};
