## Why

Today every view imports the crawl record straight from a module. That direct import
ties the whole user interface to one file. Later stories must serve many crawls, first
from YAML and then from a hosted store, without rewriting each view. We add the provider
interface now, before there are many crawls, so that later swap changes one place.

## What Changes

- Add a `Crawl` type. Its identity holds `id`, `title`, an optional `date`, and an optional
  `color`, all validated. Its definition holds the header line, schedule, venues, scavenger
  tasks and rules, map URLs, and quick links. The provider carries the definition through
  unchanged.
- Add a `CrawlProvider` interface with one method: `getCrawl(id)`. It returns a promise
  that resolves to a tagged result — found, not-found, invalid, or error. It never
  throws and never rejects.
- Add an in-repo provider. It wraps today's record as the single crawl, keyed by the
  logical id `cory-trent`, and validates that crawl's identity at the boundary.
- Resolve the crawl once in the shell and pass it to the four views as a prop. The shell
  shows a fallback when the result is not found, invalid, or an error.
- **BREAKING (internal only):** the shell and the four views stop importing the crawl
  record directly. They read the crawl only through the provider. The app looks and
  behaves the same.
- Record an ADR: the crawl sits behind a provider interface.

## Capabilities

### New Capabilities

- `crawl-provider`: resolve a crawl by its stable logical id through a provider
  interface — validate identity as data at the boundary, carry the definition through
  unchanged, and resolve to a found, not-found, invalid, or error result.

### Modified Capabilities

- `crawl-shell`: the shell obtains its crawl from the provider instead of a direct
  import. It resolves the crawl once, renders the views from it, and shows a fallback for
  a non-found result. The existing view behavior is unchanged.

## Impact

- New code: `src/lib/types.ts` (the `Crawl` type and the result shapes) and
  `src/lib/data/provider.ts` (the `CrawlProvider` interface and the in-repo
  implementation).
- Changed code: `Shell.svelte` resolves the crawl through the provider; the four views
  (`ScheduleView`, `MapView`, `VenuesView`, `TasksView`) take the crawl as a prop instead
  of importing `crawl` from `src/lib/crawl.ts`.
- The theming layer is untouched: the provider carries `color` as data and does not
  resolve a palette.
- The device storage key `crawl-checks-v1` is unchanged; per-crawl state is a later story.
- New ADR under `docs/decisions/`.
- No dependency, build, deploy, or CSP change.
