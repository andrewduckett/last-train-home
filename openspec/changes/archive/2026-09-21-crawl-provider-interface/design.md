## Context

See proposal.md — Why. Today `src/lib/crawl.ts` exports one `crawl` record and its types.
`Shell.svelte` and the four views import that record directly. The sibling project
`../hero-slate` already solved this with a `getCharacter(id)` provider; this change mirrors
that shape for crawls.

Two project constraints shape the approach. The caller must depend only on `getCrawl(id)`,
never on a file path or a data import. The provider must validate identity as data and
carry the definition through unchanged. Story 3 will load crawls from YAML at runtime, so
the read is inherently asynchronous.

Terms used below: a **crawl** is the domain object the app renders. A **record** is the
stored source data for one crawl. A **caller** is code that obtains a crawl from the
provider. In this change the shell is the only caller; the four views are not callers,
because they receive the resolved crawl as a prop rather than calling the provider.

## Goals / Non-Goals

**Goals:**

- Give the shell one way to read a crawl: `getCrawl(id)`. The views receive it as a prop.
- Make `getCrawl` asynchronous now, so story 3's YAML fetch does not change the shell.
- Split validated identity from the carried-through definition in the `Crawl` type.
- Resolve the crawl once, in the shell, and pass it to the views.
- Keep the app's look and behavior the same.

**Non-Goals:**

- Loading from YAML or disk (story 3).
- Routing or a `/<id>` path (story 3).
- More than one record (story 3).
- Per-crawl device state; the storage key `crawl-checks-v1` stays as it is (story 4).
- Generalizing the schedule, links, or map shape (story 5).
- Resolving `color` to a palette (story 6).
- Deleting the dead pre-migration files `src/data.js` and `src/config.js`.

## Decisions

### `getCrawl(id)` returns a promise

`getCrawl(id)` returns `Promise<CrawlResult>`. The promise resolves to one result and
never rejects.

Why: story 3 fetches YAML at runtime, which is asynchronous. If `getCrawl` were
synchronous now, story 3 would change the shell from a synchronous read to an asynchronous
one. Making it a promise now means the in-repo provider resolves immediately and story 3
only swaps the provider's body. The cost is a loading state in the shell now,
which the shell needs for story 3 anyway.

### A tagged result, not a throw or a null

`CrawlResult` is a discriminated union tagged by a `status` field:

- `{ status: 'found', crawl: Crawl }`
- `{ status: 'not-found', id: string }`
- `{ status: 'invalid', id: string, reason?: string }`
- `{ status: 'error', id: string, reason?: string }`

The `found` crawl's `id` equals the requested id. The other three carry the requested id.

Why over `Crawl | null`: a null cannot tell "no such crawl" from "the record is
malformed," and a caller can forget the check. Why over throwing: a throw forces
try/catch at every call site and loses the reason. The union names each outcome, which
story 3 must render distinctly.

The union lets TypeScript narrow on `status`. It does not force a caller to handle every
case; a caller that ignores a status compiles. So the shell, not the type, enforces the
handling (see the next decision).

### Split identity from the definition in the `Crawl` type

`src/lib/types.ts` holds:

```ts
interface CrawlIdentity { id: string; title: string; date?: string; color?: string }
interface CrawlDefinition {
  appTitle: string; line: string;
  schedule: ScheduleEntry[]; venues: VenueStop[];
  scavenger: ScavengerTask[]; scavengerRules: string[];
  myMapsEmbedUrl: string; myMapsAppUrl: string;
  ventraUrl: string; metraUrl: string; albumUrl: string;
}
interface Crawl extends CrawlIdentity { definition: CrawlDefinition }
```

`CrawlDefinition` is exactly today's `CrawlData` fields, moved unchanged. The provider
validates only the identity. It copies the definition through untouched. The string
`color` is data, never a resolved palette.

The `id` comes from the lookup key, not the record. The in-repo record carries no `id`
field; the provider sets `crawl.id` to the requested key when it builds the `found` result.
So a `found` crawl's `id` always equals the requested id by construction. `title`, `date`,
and `color` are the fields the provider type-checks.

Why: this is the boundary that keeps the crawl's source swappable. A hosted store later
returns the same `Crawl` shape. Keeping the definition opaque to the provider means the
schedule and theming changes (stories 5 and 6) land in their own layers, not here. The
sub-types (`ScheduleEntry`, `VenueStop`, `ScavengerTask`) move from `crawl.ts` unchanged;
story 5 owns any reshaping into a generic itinerary.

### The in-repo provider converts a retrieval throw into `error`

`src/lib/data/provider.ts` holds the `CrawlProvider` interface and a factory for the
in-repo implementation. The factory takes a retrieval function that returns the raw record
for an id, or `undefined` when none matches. The production factory passes a retrieval that
reads the in-repo record map. `getCrawl` wraps the retrieval and validation in a
try/catch: a throw becomes an `error` result. A missing record becomes `not-found`. A
record that fails identity validation becomes `invalid`. Otherwise it builds the `Crawl`,
setting `id` to the requested key, and returns `found`.

Why the injected retrieval: a test can pass a retrieval that throws into the real factory,
then assert the real `getCrawl` resolves to `error` without throwing. That tests the
production conversion path, not a separate stub. The same seam feeds malformed-record
fixtures through the real validation path.

### The shell resolves the crawl once and enforces the outcomes

`Shell.svelte` calls `getCrawl('cory-trent')` once on mount. It holds two states: pending,
or the resolved result. While pending it shows a loading state. On `found` it renders the
four views, passing the crawl down as a prop. On `not-found`, `invalid`, or `error` it shows
a fallback message and does not mount the views. It needs no throw handling, because the
provider contract forbids throws and rejection. The default id `cory-trent` is an app-level
constant for now; story 3 decides where default-crawl config lives.

Why in the shell, not each view: one resolution point means one place handles pending and
failure, and the views stay pure renderers of a passed-in crawl. It also keeps the
provider from being called again when a tab remounts.

### The header keeps reading the definition in this story

The shell's header renders `appTitle` and `line` from the definition, so the rendered
output does not change. Identity `title` is required data, and for the in-repo record it is
set to the same value as `appTitle`. Wiring identity `title` into the header waits for the
theming story, which owns how a crawl's identity drives its header.

## Risks / Trade-offs

- **The four-variant async result looks heavy for one record** → It is the contract stories
  3 and 4 build on. Building it now, with tests, is cheaper than retrofitting the shell's
  read from synchronous to asynchronous and failure-aware later.
- **`found` could be read as a stronger guarantee than it is** → State plainly that `found`
  guarantees typed identity only, and that the definition is trusted because it is the
  in-repo record. External definitions get their own checks in a later story.
- **Introducing the `cory-trent` id before YAML exists** → It is only a map key and the
  shell's default here. No file or route depends on it yet, so story 3 can still decide the
  seed's content.

## Migration Plan

This is an internal refactor with no schema, build, or deploy change. Deploy is the normal
build. Rollback is a plain revert.

The test suite is the safety net, in two parts. First, the existing view and checklist
tests stay green, and they keep the `crawl-checks-v1` key unchanged. Second, new tests
assert the seed crawl reaches the views through the provider: the header line, the ordered
schedule, a venue directions link, and each task's points. A further test switches tabs and
asserts the shell calls `getCrawl` only once.
