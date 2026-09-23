import { parseJsonYaml } from './yaml.js';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { LOGICAL_ID_PATTERN } from './id.js';

export { LOGICAL_ID_PATTERN } from './id.js';

/** @param {unknown} value */
function isRecord(value) {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** @param {string} fileName @param {string} field @returns {never} */
function invalid(fileName, field) {
	throw new Error(`${fileName}: invalid ${field}`);
}

/** @param {string} fileName @param {string} field @param {unknown} value */
function asRecord(fileName, field, value) {
	if (!isRecord(value)) invalid(fileName, field);
	return /** @type {Record<string, unknown>} */ (value);
}

/** @param {string} fileName @param {string} field @param {unknown} value */
function asArray(fileName, field, value) {
	if (!Array.isArray(value)) invalid(fileName, field);
	return value;
}

/** @param {string} fileName @param {string} field @param {unknown} value */
function asString(fileName, field, value) {
	if (typeof value !== 'string') invalid(fileName, field);
	return value;
}

/** @param {string} fileName @param {string} field @param {unknown} value */
function asFiniteNumber(fileName, field, value) {
	if (typeof value !== 'number' || !Number.isFinite(value)) invalid(fileName, field);
	return value;
}

/**
 * @param {string} fileName
 * @param {string} source
 */
export function validateCrawlSource(fileName, source) {
	const match = /^(.+)\.yaml$/.exec(fileName);
	if (!match || !LOGICAL_ID_PATTERN.test(match[1])) {
		throw new Error(`${fileName}: filename must be a lowercase logical id followed by .yaml`);
	}
	let value;
	try {
		value = parseJsonYaml(source);
	} catch (error) {
		throw new Error(`${fileName}: ${error instanceof Error ? error.message : 'invalid YAML'}`);
	}
	const record = asRecord(fileName, 'record', value);
	asString(fileName, 'title', record.title);
	for (const field of ['date', 'color']) {
		if (field in record) asString(fileName, field, record[field]);
	}
	const definition = asRecord(fileName, 'definition', record.definition);
	for (const field of [
		'appTitle',
		'line',
		'myMapsEmbedUrl',
		'myMapsAppUrl',
		'ventraUrl',
		'metraUrl',
		'albumUrl',
	]) {
		asString(fileName, `definition.${field}`, definition[field]);
	}
	const schedule = asArray(fileName, 'definition.schedule', definition.schedule);
	schedule.forEach((entry, index) => {
		const field = `definition.schedule[${index}]`;
		const scheduleEntry = asRecord(fileName, field, entry);
		for (const name of ['t', 'kind', 'tag', 'title']) {
			asString(fileName, `${field}.${name}`, scheduleEntry[name]);
		}
		if ('sub' in scheduleEntry) asString(fileName, `${field}.sub`, scheduleEntry.sub);
	});
	const venues = asArray(fileName, 'definition.venues', definition.venues);
	const seenStops = new Set();
	venues.forEach((entry, index) => {
		const field = `definition.venues[${index}]`;
		const venue = asRecord(fileName, field, entry);
		const stop = asString(fileName, `${field}.stop`, venue.stop);
		if (seenStops.has(stop)) invalid(fileName, 'definition.venues.stop duplicate');
		seenStops.add(stop);
		asString(fileName, `${field}.town`, venue.town);
		const places = asArray(fileName, `${field}.places`, venue.places);
		const seenPlaces = new Set();
		places.forEach((placeEntry, placeIndex) => {
			const placeField = `${field}.places[${placeIndex}]`;
			const place = asRecord(fileName, placeField, placeEntry);
			const name = asString(fileName, `${placeField}.n`, place.n);
			if (seenPlaces.has(name)) invalid(fileName, `${field}.places.n duplicate`);
			seenPlaces.add(name);
			asString(fileName, `${placeField}.a`, place.a);
		});
	});
	const scavenger = asArray(fileName, 'definition.scavenger', definition.scavenger);
	const seenTaskIds = new Set();
	let totalPoints = 0;
	scavenger.forEach((entry, index) => {
		const field = `definition.scavenger[${index}]`;
		const task = asRecord(fileName, field, entry);
		const id = asString(fileName, `${field}.id`, task.id);
		if (seenTaskIds.has(id)) invalid(fileName, 'definition.scavenger.id duplicate');
		seenTaskIds.add(id);
		asString(fileName, `${field}.t`, task.t);
		totalPoints += asFiniteNumber(fileName, `${field}.p`, task.p);
		asString(fileName, `${field}.d`, task.d);
	});
	if (!Number.isFinite(totalPoints) || totalPoints <= 0) {
		invalid(fileName, 'definition.scavenger.p total');
	}
	const rules = asArray(fileName, 'definition.scavengerRules', definition.scavengerRules);
	rules.forEach((rule, index) => {
		asString(fileName, `definition.scavengerRules[${index}]`, rule);
	});
	return record;
}

/** @param {string} directory */
export function validateCrawlDirectory(directory) {
	const files = readdirSync(directory, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith('.yaml'))
		.map((entry) => entry.name)
		.sort();
	for (const fileName of files) {
		validateCrawlSource(fileName, readFileSync(resolve(directory, fileName), 'utf8'));
	}
}
