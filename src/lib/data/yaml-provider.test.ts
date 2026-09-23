import { expect, it } from 'vitest';
import { createYamlCrawlProvider, type CrawlResponse } from './provider.js';

function response(body: string, init: { status?: number; contentType?: string } = {}): CrawlResponse {
	const status = init.status ?? 200;
	return {
		ok: status >= 200 && status < 300,
		status,
		headers: { get: () => init.contentType ?? 'application/yaml' },
		text: async () => body,
	};
}

it('loads a valid logical id from its crawl asset path', async () => {
	const requests: string[] = [];
	const provider = createYamlCrawlProvider(async (path) => {
		requests.push(path);
		return response('title: Evening Out\ndefinition:\n  custom: unchanged');
	});

	await expect(provider.getCrawl('evening-out')).resolves.toEqual({
		status: 'found',
		crawl: {
			id: 'evening-out',
			title: 'Evening Out',
			definition: { custom: 'unchanged' },
		},
	});
	expect(requests).toEqual(['/crawls/evening-out.yaml']);
});

it.each(['../secret', 'nested/crawl', 'Mixed-Case', 'bad_id', '-leading', 'trailing-', 'two--hyphens', ''])(
	'rejects unsupported logical id %j without a request',
	async (id) => {
		let requests = 0;
		const provider = createYamlCrawlProvider(async () => {
			requests += 1;
			return response('title: Wrong record');
		});
		await expect(provider.getCrawl(id)).resolves.toEqual({ status: 'not-found', id });
		expect(requests).toBe(0);
	},
);

it('maps a missing YAML response to not-found', async () => {
	const provider = createYamlCrawlProvider(async () => response('', { status: 404 }));
	await expect(provider.getCrawl('missing')).resolves.toEqual({ status: 'not-found', id: 'missing' });
});

it('maps a failed HTTP response to error', async () => {
	const provider = createYamlCrawlProvider(async () => response('', { status: 503 }));
	await expect(provider.getCrawl('unavailable')).resolves.toEqual({ status: 'error', id: 'unavailable' });
});

it('maps a successful HTML fallback to not-found', async () => {
	const provider = createYamlCrawlProvider(async () =>
		response('<!doctype html><title>App shell</title>', { contentType: 'text/html; charset=utf-8' }),
	);
	await expect(provider.getCrawl('missing')).resolves.toEqual({ status: 'not-found', id: 'missing' });
});

it('maps malformed YAML to invalid', async () => {
	const provider = createYamlCrawlProvider(async () => response('title: [unfinished'));
	await expect(provider.getCrawl('broken')).resolves.toEqual({ status: 'invalid', id: 'broken' });
});

it('maps a body-read failure to error', async () => {
	const failedResponse = response('unused');
	failedResponse.text = async () => {
		throw new Error('connection closed');
	};
	const provider = createYamlCrawlProvider(async () => failedResponse);
	await expect(provider.getCrawl('unreadable')).resolves.toEqual({ status: 'error', id: 'unreadable' });
});

it('maps a request failure to error', async () => {
	const provider = createYamlCrawlProvider(async () => {
		throw new Error('network unavailable');
	});
	await expect(provider.getCrawl('offline')).resolves.toEqual({ status: 'error', id: 'offline' });
});

it('preserves optional identity fields from YAML', async () => {
	const provider = createYamlCrawlProvider(async () =>
		response('title: Evening Out\ndate: September 22\ncolor: unknown-name\ndefinition: opaque'),
	);
	await expect(provider.getCrawl('evening-out')).resolves.toEqual({
		status: 'found',
		crawl: {
			id: 'evening-out',
			title: 'Evening Out',
			date: 'September 22',
			color: 'unknown-name',
			definition: 'opaque',
		},
	});
});

it('maps invalid YAML identity to invalid', async () => {
	const provider = createYamlCrawlProvider(async () => response('title: 42\ndefinition: {}'));
	await expect(provider.getCrawl('bad-identity')).resolves.toEqual({ status: 'invalid', id: 'bad-identity' });
});
