import { parseJsonYaml } from './yaml.js';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { LOGICAL_ID_PATTERN } from './id.js';
import { isQuickLinkUrl } from '../crawl/urls.js';

export { LOGICAL_ID_PATTERN } from './id.js';

/** @param {unknown} value */
function isRecord(value) {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** @param {string} fileName @param {string} field @returns {never} */
function invalid(fileName, field) {
	throw new Error(`${fileName}: invalid ${field}`);
}

/** Retired keys at each level of a crawl, mapped to the keys that replace them. */
const RETIRED_DEFINITION_KEYS = { venues: 'places' };
const RETIRED_STOP_KEYS = { places: 'locations' };
const RETIRED_LOCATION_KEYS = { n: 'name', a: 'address' };
const RETIRED_TASK_KEYS = { t: 'title', p: 'points', d: 'description' };

/**
 * @param {string} fileName
 * @param {string} field
 * @param {Record<string, unknown>} record
 * @param {Record<string, string>} retiredKeys
 */
function rejectRetiredKeys(fileName, field, record, retiredKeys) {
	for (const [retired, replacement] of Object.entries(retiredKeys)) {
		if (retired in record) invalid(fileName, `${field}.${retired} (renamed to ${replacement})`);
	}
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
function asNonemptyString(fileName, field, value) {
	const result = asString(fileName, field, value);
	if (!result.trim()) invalid(fileName, field);
	return result;
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
	if ('albumUrl' in definition) invalid(fileName, 'definition.albumUrl');
	if ('map' in definition) invalid(fileName, 'definition.map (removed; link a route map from links)');
	if ('intro' in definition) asNonemptyString(fileName, 'definition.intro', definition.intro);
	for (const field of [
		'appTitle',
		'line',
	]) {
		asString(fileName, `definition.${field}`, definition[field]);
	}
	const schedule = asArray(fileName, 'definition.schedule', definition.schedule);
	schedule.forEach((entry, index) => {
		const field = `definition.schedule[${index}]`;
		const scheduleEntry = asRecord(fileName, field, entry);
		const kind = asNonemptyString(fileName, `${field}.kind`, scheduleEntry.kind);
		if (!['stop', 'move', 'note'].includes(kind)) invalid(fileName, `${field}.kind`);
		asNonemptyString(fileName, `${field}.time`, scheduleEntry.time);
		asNonemptyString(fileName, `${field}.title`, scheduleEntry.title);
		if (kind === 'move') asNonemptyString(fileName, `${field}.mode`, scheduleEntry.mode);
		if ('tag' in scheduleEntry) asNonemptyString(fileName, `${field}.tag`, scheduleEntry.tag);
		if ('note' in scheduleEntry) asNonemptyString(fileName, `${field}.note`, scheduleEntry.note);
	});
	const links = asArray(fileName, 'definition.links', definition.links);
	links.forEach((entry, index) => {
		const field = `definition.links[${index}]`;
		const link = asRecord(fileName, field, entry);
		asNonemptyString(fileName, `${field}.label`, link.label);
		if ('hint' in link) asNonemptyString(fileName, `${field}.hint`, link.hint);
		if (!isQuickLinkUrl(link.url)) invalid(fileName, `${field}.url`);
	});
	rejectRetiredKeys(fileName, 'definition', definition, RETIRED_DEFINITION_KEYS);
	const places = asArray(fileName, 'definition.places', definition.places);
	const seenStops = new Set();
	places.forEach((entry, index) => {
		const field = `definition.places[${index}]`;
		const stopEntry = asRecord(fileName, field, entry);
		rejectRetiredKeys(fileName, field, stopEntry, RETIRED_STOP_KEYS);
		const stop = asString(fileName, `${field}.stop`, stopEntry.stop);
		if (seenStops.has(stop)) invalid(fileName, 'definition.places.stop duplicate');
		seenStops.add(stop);
		asString(fileName, `${field}.town`, stopEntry.town);
		const locations = asArray(fileName, `${field}.locations`, stopEntry.locations);
		if (locations.length === 0) invalid(fileName, `${field}.locations`);
		const seenNames = new Set();
		locations.forEach((locationEntry, locationIndex) => {
			const locationField = `${field}.locations[${locationIndex}]`;
			const location = asRecord(fileName, locationField, locationEntry);
			rejectRetiredKeys(fileName, locationField, location, RETIRED_LOCATION_KEYS);
			const name = asString(fileName, `${locationField}.name`, location.name);
			if (seenNames.has(name)) invalid(fileName, `${field}.locations.name duplicate`);
			seenNames.add(name);
			asString(fileName, `${locationField}.address`, location.address);
			if ('label' in location) asNonemptyString(fileName, `${locationField}.label`, location.label);
		});
	});
	const scavenger = asArray(fileName, 'definition.scavenger', definition.scavenger);
	const seenTaskIds = new Set();
	let totalPoints = 0;
	scavenger.forEach((entry, index) => {
		const field = `definition.scavenger[${index}]`;
		const task = asRecord(fileName, field, entry);
		rejectRetiredKeys(fileName, field, task, RETIRED_TASK_KEYS);
		const id = asString(fileName, `${field}.id`, task.id);
		if (seenTaskIds.has(id)) invalid(fileName, 'definition.scavenger.id duplicate');
		seenTaskIds.add(id);
		asString(fileName, `${field}.title`, task.title);
		totalPoints += asFiniteNumber(fileName, `${field}.points`, task.points);
		asString(fileName, `${field}.description`, task.description);
	});
	if (!Number.isFinite(totalPoints) || totalPoints <= 0) {
		invalid(fileName, 'definition.scavenger.points total');
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
