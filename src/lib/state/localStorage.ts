import type { CheckedTasks, ChecksStore } from './store.js';

function checkedEntries(value: unknown): CheckedTasks {
	const checks: CheckedTasks = Object.create(null);
	if (typeof value !== 'object' || value === null || Array.isArray(value)) return checks;
	for (const [id, checked] of Object.entries(value)) {
		if (checked === true) checks[id] = true;
	}
	return checks;
}

export const localStorageChecksStore: ChecksStore = {
	loadChecks(id) {
		try {
			const raw = localStorage.getItem(`crawl-checks:${id}`);
			if (raw === null) return { status: 'ok', checks: checkedEntries(null) };
			try {
				return { status: 'ok', checks: checkedEntries(JSON.parse(raw)) };
			} catch {
				return { status: 'ok', checks: checkedEntries(null) };
			}
		} catch {
			return { status: 'unavailable' };
		}
	},
	saveChecks(id, checks) {
		try {
			localStorage.setItem(`crawl-checks:${id}`, JSON.stringify(checkedEntries(checks)));
			return true;
		} catch {
			return false;
		}
	},
};
