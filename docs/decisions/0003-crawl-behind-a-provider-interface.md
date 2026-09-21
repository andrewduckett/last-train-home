# 0003. Crawl behind a provider interface

- Status: accepted
- Date: 2026-09-21
- Supersedes: none
- Superseded by: none

## Context

Last Train Home renders "crawls" — themed, timed outings. Each crawl is a schedule,
venues, a scavenger checklist, quick links, and a map. A crawl is addressed by a stable
logical id, a short name like `cory-trent`, not a filename.

At the start of this decision, every screen imports the one crawl record straight from a
data module. That direct import ties the whole user interface to one file and one source.

The project must grow from one crawl to many. The crawls will first come from hand-edited
files, and later from a hosted store with accounts and cross-device sync. If each screen
keeps importing the source itself, that later move rewrites every screen. So we settle
where the source sits before there are many crawls.

## Decision

We put every crawl behind a provider. A provider module owns retrieval: where a crawl
comes from and how it is validated. We call the code that obtains a crawl the caller. The
shell is the only caller: it calls `getCrawl(id)` once per mount and passes the resolved
crawl to its views as a prop. A view does not call the provider. A caller obtains a crawl
only through `getCrawl(id)`, never from a file path or a data import. That restriction
governs how a crawl is obtained, not what a view renders; a view still renders URLs that
the definition carries. The views own how a crawl is rendered.

`getCrawl(id)` returns a promise. The read is asynchronous now because the file-backed
provider will fetch at runtime; making it a promise later would change the shell. The
promise resolves to one of four outcomes: the crawl was found, no crawl matched the id, a
record was found but its identity was invalid, or retrieval failed. The provider never
throws and never rejects. The shell inspects the outcome and handles each case.

The provider validates identity as data. It requires a `title` and type-checks the optional
`date` and `color`. It carries the rest of the definition through untouched. It does not
interpret the definition, and it does not resolve a `color` name to a palette; a later
theming layer does that. A `found` result therefore guarantees a present, correctly typed
identity only. It does not guarantee a well-formed definition. Today the definition is
trusted because it is the in-repo record. A later story that loads definitions from outside
the repo will validate them in the layer that owns their meaning.

We rejected two alternatives. Letting screens keep importing the record is simplest today.
But it forces a rewrite of every screen when the source changes. Returning a crawl or
nothing — a null — is also simpler. But a null cannot tell an unknown id from a malformed
record, and a caller can forget the check. The four named outcomes make each case explicit.

## Consequences

- Changing the source changes the provider alone. The shell keeps calling `getCrawl(id)`.
  The file-backed provider, and later the hosted one, swap the provider's body.
- The shell must handle "not found," "invalid," and "error," not just the happy path. That
  is more code at the one call site. It is what lets a bad crawl fail safely instead of
  breaking a page.
- The result type lets the compiler narrow on the outcome. It does not force a caller to
  handle every case. The shell enforces that by resolving the crawl once and rendering a
  fallback for any non-found outcome.
- Validation and rendering stay in separate layers. The provider checks identity as data.
  The theming layer resolves a `color` to a palette. Neither reaches into the other.
- Per-device state, such as the scavenger checklist, can key on the same logical id the
  provider resolves. That keeps device state separate from the crawl definition.
