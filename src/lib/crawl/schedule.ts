import type { ScheduleEntry, ScheduleKind } from '../types.js';

const kinds: ScheduleKind[] = ['stop', 'move', 'note'];
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

export function resolveSchedule(value: unknown): ScheduleEntry[] {
	if (!Array.isArray(value)) return [];
	return value.filter((entry): entry is ScheduleEntry => {
		if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return false;
		const item = entry as Record<string, unknown>;
		return kinds.includes(item.kind as ScheduleKind) && text(item.time) && text(item.title)
			&& (item.kind !== 'move' || text(item.mode))
			&& (!('tag' in item) || text(item.tag))
			&& (!('note' in item) || text(item.note));
	});
}
