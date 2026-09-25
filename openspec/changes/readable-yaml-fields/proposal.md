## Why

An author who writes a crawl in YAML meets one-letter keys: `n` and `a` on venue places, and `t`, `p`, and `d` on scavenger tasks. The author cannot tell what these keys mean without reading the app's code. Story #16 will copy this schema into a second crawl, so the rename costs least now, while only one crawl uses it.

## What Changes

- **BREAKING (authoring):** a venue place uses `name` and `address` instead of `n` and `a`.
- **BREAKING (authoring):** a scavenger task uses `title`, `points`, and `description` instead of `t`, `p`, and `d`.
- The build rejects a crawl that still uses an old key. The error names the record, the field, and the new key to use.
- The seed crawl `cory-trent.yaml`, the TypeScript types, the Venues and Tasks views, build validation, tests, and the authoring spec all move to the new keys.
- Error messages for duplicate places and the points total name the new keys: `places.name duplicate` and `scavenger.points total`.

Crawlers see no change:

- The Venues and Tasks tabs render the same text, points, tally, and directions links.
- Task `id` values stay the same, so checks saved on a device still match their tasks.

Out of scope:

- Schedule keys, which already use full words.
- Scavenger scoring rules.
- The stored checklist format.
- Whether `description` becomes optional. The product plan lists it as optional, but the build requires it today. This change keeps it required.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `crawl-authoring`: the build validates venue places and scavenger tasks under their new key names and rejects the old one-letter keys. The duplicate-place and points-total rules name the new keys.

`crawl-shell` does not change. Its requirements describe what the Venues and Tasks tabs show, not the YAML keys, and what they show stays the same. `crawl-provider` does not change, because the provider carries the definition through without reading these keys.

## Impact

- `static/crawls/cory-trent.yaml`: rename the keys in all 4 places and all 7 tasks.
- `src/lib/types.ts`: rename the `VenuePlace` and `ScavengerTask` fields.
- `src/lib/VenuesView.svelte` and `src/lib/TasksView.svelte`: read the new fields.
- `src/lib/data/validate.js`: check the new keys and reject the old ones.
- Tests and fixtures: `validate.test.ts`, `validate-generic.test.ts`, `Shell.provider.test.ts`, `VenuesView.test.ts`, and `tests/fixtures/cory-trent.json`.
- `openspec/discovery.md`: the Author's "pain today" note about one-letter keys no longer applies.
- No change to the provider, the checklist store, routing, theming, or the content security policy.
- A crawl file kept outside this repo with old keys will fail the build until its author renames them.
