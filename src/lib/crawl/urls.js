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
