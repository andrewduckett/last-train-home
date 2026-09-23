## Why

Two crawls can now share one device, but their checklists still use one storage key. A tick in one crawl can appear in another when task ids match.

## What Changes

- Store scavenger checks separately for each crawl's logical id.
- Restore only checks for tasks still present in that crawl.
- Put checklist loading and saving behind a state-store interface.
- Replace the old global storage key with `crawl-checks:<id>`. The event has not yet collected participant checks, so no legacy import is needed.
- Keep the current tally, confirmation, and reset controls.

## Capabilities

### New Capabilities

None. The crawl shell already owns checklist behavior.

### Modified Capabilities

- `crawl-shell`: Persist checks per crawl, reconcile them with current tasks, and remove the obsolete global-key promise.

## Impact

The Tasks view and its reactive checklist logic will use a new state-store interface and a localStorage adapter. Checklist tests and the crawl-shell spec will change. Crawl definitions, routes, and the provider will keep their current contracts.
