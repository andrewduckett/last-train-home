export type ScheduleKind = 'stop' | 'move' | 'note';

export interface ScheduleEntry {
	time: string;
	kind: ScheduleKind;
	tag?: string;
	title: string;
	mode?: string;
	note?: string;
}

export interface QuickLink { label: string; hint?: string; url: string }
export interface CrawlMap { embed: string; app: string }

export interface StopLocation {
	name: string;
	address: string;
	label?: string;
}

export interface PlaceStop {
	stop: string;
	town: string;
	locations: StopLocation[];
}

export interface ScavengerTask {
	id: string;
	title: string;
	points: number;
	description: string;
}

export interface CrawlDefinition {
	appTitle: string;
	line: string;
	intro?: string;
	schedule: ScheduleEntry[];
	places: PlaceStop[];
	scavenger: ScavengerTask[];
	scavengerRules: string[];
	links: QuickLink[];
	map: CrawlMap;
}

export interface CrawlIdentity {
	id: string;
	title: string;
	date?: string;
	color?: string;
}

export interface Crawl extends CrawlIdentity {
	definition: CrawlDefinition;
}

export type CrawlResult =
	| { status: 'found'; crawl: Crawl }
	| { status: 'not-found'; id: string }
	| { status: 'invalid'; id: string; reason?: string }
	| { status: 'error'; id: string; reason?: string };
