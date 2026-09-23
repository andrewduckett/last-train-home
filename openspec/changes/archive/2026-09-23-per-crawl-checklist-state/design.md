## Context

See proposal.md for the problem and the crawl-shell delta spec for the expected behavior. Today `checks.svelte.ts` creates one module-level reactive object. `TasksView.svelte` reads that object for every crawl. The object loads once from `crawl-checks-v1`, so route changes cannot select another checklist.

`CrawlRoute.svelte` already keys the shell by logical id. The shell receives a resolved crawl with both its id and task list. This gives the checklist everything it needs without adding state to the crawl provider.

## Goals / Non-Goals

**Goals:**

- Keep definition data and device checks separate.
- Make crawl id the only storage partition key.
- Preserve immediate toggles, tally updates, and the current Reset confirmation.
- Keep storage failures from breaking the Tasks view.

**Non-Goals:**

- Sync checks between devices or browser tabs.
- Import `crawl-checks-v1` or define a general migration system.
- Change task authoring, points, routes, or reset controls.

## Decisions

### 1. Put persistence behind a small, synchronous interface

Define `loadChecks(id)` and `saveChecks(id, checks)` in `src/lib/state/store.ts`. The value is a JSON-clean record of task ids to `true`. The interface does not know task labels, points, or which ids are current.

`loadChecks` returns `{ status: 'ok', checks }` or `{ status: 'unavailable' }`. Missing or malformed data produces an empty `ok` record. `saveChecks` returns `true` after a successful write and `false` when a write fails. Neither method throws.

Implement the interface with localStorage in `src/lib/state/localStorage.ts`. It reads and writes `crawl-checks:<id>`. It accepts only own record entries whose values are literal `true`. The adapter catches storage exceptions and reports failure through the interface. It holds no session cache.

Synchronous loading lets the Tasks view show the correct tally on its first render. A future hosted implementation can keep a device cache behind this interface while it syncs remotely. Live cross-device updates would need a later contract extension.

We considered putting localStorage calls directly in the view. That would tie presentation to the current device store. We also considered an asynchronous interface now. It would add a loading state and write ordering for a source that is synchronous in this release.

### 2. Keep one reactive checklist controller for each mounted shell

Replace the module-level `checksStore` with a factory in `checks.svelte.ts`. The shell creates one controller after resolving its crawl, then passes it to the Tasks view. The controller loads through the interface, owns reactive checks, and saves after a toggle or confirmed reset.

The controller intersects loaded checks with current task ids before exposing them. It keeps only checked entries. It saves the filtered record after a later edit, so deleted tasks cannot return. It checks own keys when reading task ids, including special names such as `constructor` and `__proto__`.

`CrawlRoute.svelte` remounts the shell when the id changes. Tab changes remount only the Tasks view, leaving the controller and any unsaved edits in the shell. The root route and `/<id>` use the same logical id when they show the same crawl.

When the participant opens Tasks, the controller refreshes from device storage if it has no unsaved edits. A successful read replaces its current snapshot after task-id reconciliation. A failed read leaves the current snapshot unchanged. A controller with unsaved edits keeps them until a successful save or the shell unmounts.

We considered a global reactive map keyed by crawl id. It would retain state across routes, but it would duplicate the device store. The shell lifetime already spans tab changes, which is the memory fallback this release needs.

### 3. Keep failures local and edits immediate

The controller updates reactive checks before saving. If a write fails, it marks its snapshot as unsaved and keeps it through tab changes. A full reload can restore only the last successful device write. A later successful save clears the unsaved flag. Reset keeps the existing confirmation and clears only the current crawl's checks.

We considered surfacing a storage error in the Tasks view. The current shell promises an operable checklist when storage is unavailable, and this change adds no new error UI.

## Risks / Trade-offs

- **A task id disappears from a crawl** → filter it on load and exclude it from every later save.
- **Two crawls use the same task id** → give them separate storage keys and controllers.
- **Storage is blocked or full** → keep unsaved checks in the shell controller across tab changes.
- **Another tab changes the same crawl's checks** → opening Tasks refreshes saved checks when this shell has no unsaved edits. An already mounted view does not receive live updates.
- **Another tab saves while this shell has unsaved edits** → this shell keeps its unsaved snapshot. A later successful save can overwrite the other tab's value. This release provides no cross-tab conflict resolution.
- **Two tabs save at the same time** → device storage has no transaction or conflict resolution here. Last completed write wins for concurrent edits to the same crawl.
- **A future hosted store needs remote reads** → retain a device cache behind the interface or extend the contract when sync becomes a product requirement.

## Migration Plan

1. Write tests for per-crawl isolation, reloads, stale task ids, malformed data, special task ids, and storage errors across tab changes.
2. Add the interface and localStorage adapter. Replace the singleton with a per-shell controller.
3. Connect the Tasks view, preserve tally and Reset behavior, then run tests, type checks, and the static build.
4. Deploy without copying `crawl-checks-v1`. Roll back by reverting this change if the checklist fails before release.
