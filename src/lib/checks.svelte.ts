import { localStorageChecksStore } from './state/localStorage.js';
import type { CheckedTasks, ChecksStore } from './state/store.js';

export function createChecksController(
	id: string,
	taskIds: string[],
	store: ChecksStore = localStorageChecksStore,
) {
	const currentIds = new Set(taskIds);
	let checks = $state<CheckedTasks>({});
	let dirty = false;

	function currentChecks(saved: CheckedTasks): CheckedTasks {
		const next: CheckedTasks = Object.create(null);
		for (const taskId of currentIds) {
			if (Object.hasOwn(saved, taskId) && saved[taskId] === true) next[taskId] = true;
		}
		return next;
	}

	function refresh() {
		if (dirty) return;
		const loaded = store.loadChecks(id);
		if (loaded.status === 'ok') checks = currentChecks(loaded.checks);
	}

	function save() {
		dirty = !store.saveChecks(id, checks);
	}

	refresh();

	return {
		get checks() { return checks; },
		refresh,
		toggle(taskId: string) {
			if (!currentIds.has(taskId)) return;
			const next = currentChecks(checks);
			if (Object.hasOwn(next, taskId)) delete next[taskId];
			else next[taskId] = true;
			checks = next;
			save();
		},
		reset() {
			checks = {};
			save();
		},
	};
}

export type ChecksController = ReturnType<typeof createChecksController>;
