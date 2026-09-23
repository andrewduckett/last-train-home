export type CheckedTasks = Record<string, true>;

export type ChecksLoadResult =
	| { status: 'ok'; checks: CheckedTasks }
	| { status: 'unavailable' };

export interface ChecksStore {
	loadChecks(id: string): ChecksLoadResult;
	saveChecks(id: string, checks: CheckedTasks): boolean;
}
