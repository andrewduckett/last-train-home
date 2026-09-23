import { parseDocument } from 'yaml';

/**
 * @param {unknown} value
 * @param {Set<object>} [ancestors]
 */
function assertJsonClean(value, ancestors = new Set()) {
	if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
	if (typeof value === 'number') {
		if (Number.isFinite(value)) return;
		throw new Error('YAML contains a value that is not JSON-clean');
	}
	if (typeof value !== 'object') {
		throw new Error('YAML contains a value that is not JSON-clean');
	}
	if (ancestors.has(value)) {
		throw new Error('YAML contains a value that is not JSON-clean');
	}
	ancestors.add(value);
	if (Array.isArray(value)) {
		for (const item of value) assertJsonClean(item, ancestors);
	} else {
		const prototype = Object.getPrototypeOf(value);
		if (prototype !== Object.prototype && prototype !== null) {
			throw new Error('YAML contains a value that is not JSON-clean');
		}
		for (const item of Object.values(value)) assertJsonClean(item, ancestors);
	}
	ancestors.delete(value);
}

/** @param {string} source */
export function parseJsonYaml(source) {
	const document = parseDocument(source);
	if (document.errors.length > 0) {
		throw new Error(`Invalid YAML: ${document.errors[0].message}`);
	}
	const value = document.toJS();
	assertJsonClean(value);
	return /** @type {unknown} */ (value);
}
