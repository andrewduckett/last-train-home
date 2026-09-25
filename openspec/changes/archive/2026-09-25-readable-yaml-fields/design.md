## Context

The one-letter keys appear in five kinds of places:

- the seed YAML, `static/crawls/cory-trent.yaml`;
- the `VenuePlace` and `ScavengerTask` types in `src/lib/types.ts`;
- `VenuesView.svelte` and `TasksView.svelte`, which read the fields;
- build validation in `src/lib/data/validate.js`, including two error labels;
- test data: `tests/fixtures/cory-trent.json`, inline YAML in `validate.test.ts`, and inline objects in `validate-generic.test.ts` and `Shell.provider.test.ts`.

Two constraints shape the approach:

- The runtime provider validates identity only. It carries the definition through without reading these keys. So the build is the only place that can catch an old key.
- `tests/fixtures/cory-trent-before.json` is a frozen snapshot of the seed from before the YAML move. `Shell.parity.test.ts` compares the live seed against it to prove that crawlers see the same content.

See `proposal.md` for why the rename happens now.

## Goals / Non-Goals

**Goals:**

- Make each key say what it holds, so an author can fill in a crawl without reading code.
- Turn a forgotten old key into a clear build error, not a blank row on the day.
- Prove, by test, that crawlers see the same content and keep their saved checks.

**Non-Goals:**

- A general "unknown key" check. The build rejects only the five retired keys.
- Accepting both spellings during a transition period.
- Any change to the runtime provider.

## Decisions

### One key map, used for both rejection and error text

`validate.js` gets one small table per record type that maps each retired key to its replacement:

```js
const RETIRED_PLACE_KEYS = { n: 'name', a: 'address' };
const RETIRED_TASK_KEYS = { t: 'title', p: 'points', d: 'description' };
```

Before it checks a place or task, the validator walks the table. If the record holds a retired key, it throws: `<file>: invalid <field>.n (renamed to name)`. The check runs first, so an author who wrote `n` sees that message instead of a less helpful "invalid `name`".

- **Why a table over five `if` lines:** the error text and the rejected key come from one source, so they cannot drift apart.
- **Why the existing `invalid()` format:** every current error reads `<file>: invalid <field>`. Existing tests match that pattern, and so will the new ones. The `(renamed to …)` suffix adds the fix without breaking the format.

### Reject old keys; do not translate them

The build fails on an old key. It does not rename the key for the author.

- **Why:** only one crawl exists, and this change renames it. A translation layer would keep two spellings alive and put key knowledge in the provider, which the project rules forbid.
- **Alternative considered:** accept both spellings with a warning. That leaves the schema ambiguous for the crawl that story #16 copies.

### Error labels use the new keys

`places.n duplicate` becomes `places.name duplicate`. `scavenger.p total` becomes `scavenger.points total`. Tests that match these labels move with them.

### Keep the "before" snapshot frozen; map it in the parity test

`cory-trent-before.json` stays as it is. It records what crawlers saw before, so editing it would weaken the proof. The parity test instead maps each old record to the new shape before it compares, for example `{ name: place.n, address: place.a }`. Then it checks the rendered text for each field, as it does today.

- **Why:** the test then proves two things at once. The renamed seed holds the same values, and the views still show them.

### Task ids and checklist storage stay untouched

The checklist store keys each check by task `id`. This change does not rename `id` or touch the store. So checks saved before the change still match. A test loads saved checks for the seed crawl and confirms the Tasks tab shows them as checked.

## Risks / Trade-offs

- [An author has an old-key crawl file outside this repo] → The build does not see that file. Once the author adds it to `static/crawls/`, the build fails with a message that names each replacement key. The fix is a find-and-replace.
- [A view reads a field that validation no longer checks, or the reverse] → `svelte-check` catches a view that reads a removed type field. The parity and view tests catch a blank render.
- [Short keys also appear in unrelated code, such as `a` in `palette.test.ts`] → The rename is by hand, file by file, not a repo-wide search and replace.

## Migration Plan

1. Land the change. The seed YAML, types, views, validation, and tests move in the same pull request, so `main` never holds a mix.
2. Rollback: revert the pull request. Saved checks survive either way, because task ids do not change.
