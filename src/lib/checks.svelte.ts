const STORE_KEY = 'crawl-checks-v1';

function loadChecks(): Record<string, boolean> {
	try {
		const raw = localStorage.getItem(STORE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
		return parsed as Record<string, boolean>;
	} catch {
		return {};
	}
}

function saveChecks(checks: Record<string, boolean>): void {
	try {
		localStorage.setItem(STORE_KEY, JSON.stringify(checks));
	} catch {
		// ignore storage errors
	}
}

function createChecksStore() {
	let checks = $state<Record<string, boolean>>(loadChecks());

	return {
		get checks() {
			return checks;
		},
		toggle(id: string) {
			checks = { ...checks, [id]: !checks[id] };
			saveChecks(checks);
		},
		resetMany(ids: string[]) {
			const next = { ...checks };
			for (const id of ids) delete next[id];
			checks = next;
			saveChecks(checks);
		},
	};
}

export const checksStore = createChecksStore();
