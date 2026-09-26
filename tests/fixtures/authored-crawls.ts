// Checks a directory of authored crawls against the crawl contract: each file
// passes build validation and resolves through the YAML provider by its id.
// It asserts no authored content, so an author can edit any valid crawl freely.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createYamlCrawlProvider } from '../../src/lib/data/provider.js';
import { validateCrawlSource } from '../../src/lib/data/validate.js';

/** Returns the checked logical ids, sorted. Throws with the file or id that fails. */
export async function checkAuthoredCrawls(directory: string, defaultId: string): Promise<string[]> {
	const files = readdirSync(directory).filter((name) => name.endsWith('.yaml')).sort();
	const { getCrawl } = createYamlCrawlProvider(async (path) => {
		const file = join(directory, path.replace(/^\/crawls\//, ''));
		const found = existsSync(file);
		return {
			ok: found,
			status: found ? 200 : 404,
			headers: { get: () => 'application/yaml' },
			text: async () => (found ? readFileSync(file, 'utf8') : ''),
		};
	});
	const ids: string[] = [];
	for (const file of files) {
		validateCrawlSource(file, readFileSync(join(directory, file), 'utf8'));
		const id = file.replace(/\.yaml$/, '');
		const result = await getCrawl(id);
		if (result.status !== 'found' || result.crawl.id !== id) {
			throw new Error(`${file}: the provider returned ${result.status}, not found`);
		}
		ids.push(id);
	}
	if (!ids.includes(defaultId)) {
		throw new Error(`default crawl "${defaultId}" has no authored record in ${directory}`);
	}
	return ids;
}
