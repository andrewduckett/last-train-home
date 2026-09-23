import { expect, it } from 'vitest';
import { createChecksController } from './checks.svelte.js';
import type { CheckedTasks, ChecksStore } from './state/store.js';

function memoryStore(initial: CheckedTasks = {}) {
	let saved = initial;
	let readable = true;
	let writable = true;
	const store: ChecksStore = {
		loadChecks: () => readable ? { status: 'ok', checks: saved } : { status: 'unavailable' },
		saveChecks: (_id, checks) => {
			if (!writable) return false;
			saved = checks;
			return true;
		},
	};
	return {
		store,
		get saved() { return saved; },
		set saved(value: CheckedTasks) { saved = value; },
		set readable(value: boolean) { readable = value; },
		set writable(value: boolean) { writable = value; },
	};
}

it('toggles a task on and off', () => {
	const controller = createChecksController('first', ['photo'], memoryStore().store);
	controller.toggle('photo');
	expect(controller.checks).toEqual({ photo: true });
	controller.toggle('photo');
	expect(controller.checks).toEqual({});
});

it('resets current checks', () => {
	const device = memoryStore({ photo: true });
	const controller = createChecksController('first', ['photo'], device.store);
	controller.reset();
	expect(controller.checks).toEqual({});
	expect(device.saved).toEqual({});
});

it.each(['constructor', '__proto__', 'toString'])('handles prototype-shaped task id %s', (id) => {
	const controller = createChecksController('first', [id], memoryStore().store);
	expect(Object.hasOwn(controller.checks, id)).toBe(false);
	controller.toggle(id);
	expect(Object.hasOwn(controller.checks, id)).toBe(true);
	controller.toggle(id);
	expect(Object.hasOwn(controller.checks, id)).toBe(false);
});

it('excludes removed ids from exposed checks and later saves', () => {
	const device = memoryStore({ removed: true, photo: true });
	const controller = createChecksController('first', ['photo', 'toast'], device.store);
	expect(controller.checks).toEqual({ photo: true });
	controller.toggle('toast');
	expect(device.saved).toEqual({ photo: true, toast: true });
});

it('refreshes a clean controller from newer saved checks', () => {
	const device = memoryStore();
	const controller = createChecksController('first', ['photo'], device.store);
	device.saved = { photo: true };
	controller.refresh();
	expect(controller.checks).toEqual({ photo: true });
});

it('retains current checks when a refresh read fails', () => {
	const device = memoryStore({ photo: true });
	const controller = createChecksController('first', ['photo'], device.store);
	device.readable = false;
	controller.refresh();
	expect(controller.checks).toEqual({ photo: true });
});

it('retains a failed write in memory', () => {
	const device = memoryStore();
	device.writable = false;
	const controller = createChecksController('first', ['photo'], device.store);
	controller.toggle('photo');
	expect(controller.checks).toEqual({ photo: true });
});

it('keeps unsaved edits over a later successful read', () => {
	const device = memoryStore();
	device.writable = false;
	const controller = createChecksController('first', ['photo', 'toast'], device.store);
	controller.toggle('photo');
	device.saved = { toast: true };
	controller.refresh();
	expect(controller.checks).toEqual({ photo: true });
});

it('refreshes again after a later successful save', () => {
	const device = memoryStore();
	device.writable = false;
	const controller = createChecksController('first', ['photo', 'toast'], device.store);
	controller.toggle('photo');
	device.writable = true;
	controller.toggle('toast');
	device.saved = { toast: true };
	controller.refresh();
	expect(controller.checks).toEqual({ toast: true });
});
