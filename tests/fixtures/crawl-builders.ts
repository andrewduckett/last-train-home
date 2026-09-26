// Builds made-up crawls for tests. Every default is invented, so an author can
// edit any real crawl without breaking a test. A test overrides only the fields
// it asserts on, and asserts against the values it passed in.
import type {
	Crawl,
	CrawlDefinition,
	PlaceStop,
	QuickLink,
	ScavengerTask,
	ScheduleEntry,
	StopLocation,
} from '../../src/lib/types.js';

export interface CrawlRecord {
	title: string;
	date?: string;
	color?: string;
	definition: CrawlDefinition;
}

export interface RecordOverrides {
	title?: string;
	date?: string;
	color?: string;
	definition?: Partial<CrawlDefinition>;
}

// Drops keys a test set to undefined, so the result stays JSON-clean.
function defined<T extends object>(value: T): T {
	return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;
}

export function stopEntry(overrides: Partial<ScheduleEntry> = {}): ScheduleEntry {
	return defined({ time: '6:00 PM', kind: 'stop', tag: 'Meet at', title: 'Harbor Square fountain', note: '1 Fountain Way', ...overrides });
}

export function moveEntry(overrides: Partial<ScheduleEntry> = {}): ScheduleEntry {
	return defined({ time: '6:20 PM', kind: 'move', tag: 'Leave', title: 'Head to Mill Street', mode: '10 min walk', ...overrides });
}

export function noteEntry(overrides: Partial<ScheduleEntry> = {}): ScheduleEntry {
	return defined({ time: '7:10 PM', kind: 'note', tag: 'Heads up', title: 'Settle up before leaving', note: 'Cards only', ...overrides });
}

export function location(overrides: Partial<StopLocation> = {}): StopLocation {
	return defined({ name: 'The Copper Kettle', address: '14 Mill St', label: 'Bar', ...overrides });
}

export function placeStop(overrides: Partial<PlaceStop> = {}): PlaceStop {
	return { stop: 'Stop 1', town: 'Mill Town', locations: [location()], ...overrides };
}

export function task(overrides: Partial<ScavengerTask> = {}): ScavengerTask {
	return { id: 'lantern-photo', title: 'Lantern Photo', points: 10, description: 'Take a photo under a street lantern.', ...overrides };
}

export function link(overrides: Partial<QuickLink> = {}): QuickLink {
	return defined({ label: 'Event page', hint: 'Details and updates', url: 'https://example.com/event', ...overrides });
}

export function buildDefinition(overrides: Partial<CrawlDefinition> = {}): CrawlDefinition {
	return {
		appTitle: 'Lantern Loop',
		line: 'Harbor Square → Mill Street → Harbor Square',
		intro: 'Join us for a lantern-lit loop through town.\n\nBring a jacket and a **charged phone**.',
		schedule: [
			stopEntry(),
			moveEntry(),
			stopEntry({ time: '6:30 PM', tag: 'Arrive at', title: 'Stop 1 · The Copper Kettle', note: '14 Mill St' }),
			noteEntry(),
		],
		places: [
			placeStop({
				stop: 'Meetup',
				town: 'Harbor Town',
				locations: [location({ name: 'Harbor Square fountain', address: '1 Fountain Way', label: undefined })],
			}),
			placeStop({
				locations: [
					location({ name: 'Mill Street Station', address: '2 Rail Rd', label: 'Train' }),
					location(),
				],
			}),
		],
		scavenger: [
			task(),
			task({ id: 'group-toast', title: 'Group Toast', points: 25, description: 'Get the whole group into one toast.' }),
		],
		scavengerRules: ['One photo per task.'],
		links: [link(), link({ label: 'Route map', hint: undefined, url: 'https://example.com/route' })],
		...overrides,
	};
}

export function buildRecord({ definition, ...identity }: RecordOverrides = {}): CrawlRecord {
	return defined({ title: 'Lantern Loop', color: 'amber', ...identity, definition: buildDefinition(definition) });
}

export function buildCrawl(id: string, overrides: RecordOverrides = {}): Crawl {
	return { id, ...buildRecord(overrides) };
}
