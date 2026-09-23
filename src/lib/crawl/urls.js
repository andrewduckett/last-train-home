/** @param {unknown} value @returns {URL | null} */
function parse(value) {
	if (typeof value !== 'string' || !value.trim()) return null;
	try {
		const url = new URL(value);
		return url.username || url.password ? null : url;
	} catch {
		return null;
	}
}

/** @param {unknown} value */
export function isQuickLinkUrl(value) {
	const url = parse(value);
	return url !== null && (url.protocol === 'http:' || url.protocol === 'https:');
}

/** @param {unknown} value @returns {URL | null} */
function mapUrl(value) {
	const url = parse(value);
	return url?.origin === 'https://www.google.com' ? url : null;
}

/** @param {string} path */
function embedPath(path) {
	return ['/maps/d/embed', '/maps/embed'].some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/** @param {unknown} value */
export function isMapEmbedUrl(value) {
	const url = mapUrl(value);
	return url !== null && embedPath(url.pathname);
}

/** @param {unknown} value */
export function isMapViewerUrl(value) {
	const url = mapUrl(value);
	return url !== null && url.pathname.startsWith('/maps/') && !embedPath(url.pathname);
}

/** @param {unknown} value @returns {value is string} */
const text = (value) => typeof value === 'string' && value.trim().length > 0;

/** @param {unknown} value @returns {import('../types.js').QuickLink[]} */
export function resolveLinks(value) {
	if (!Array.isArray(value)) return [];
	return value.filter((entry) => {
		if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return false;
		const link = /** @type {Record<string, unknown>} */ (entry);
		return text(link.label) && isQuickLinkUrl(link.url) && (!('hint' in link) || text(link.hint));
	});
}

/** @param {unknown} value @returns {import('../types.js').CrawlMap | null} */
export function resolveMap(value) {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
	const map = /** @type {Record<string, unknown>} */ (value);
	return isMapEmbedUrl(map.embed) && isMapViewerUrl(map.app) ? /** @type {import('../types.js').CrawlMap} */ (/** @type {unknown} */ (map)) : null;
}
