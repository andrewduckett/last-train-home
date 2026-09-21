## Purpose

The crawl provider resolves a crawl by its stable logical id. It is the one place the app
reads a crawl from its source, so the source can change later without changing the screens.

## ADDED Requirements

### Requirement: Resolve a crawl through the provider

The provider SHALL expose `getCrawl(id: string): Promise<CrawlResult>` as the only way a
caller obtains a crawl. The promise SHALL resolve to exactly one result: `found`,
`not-found`, `invalid`, or `error`. The promise SHALL NOT reject, and the call SHALL NOT
throw. A `found` result SHALL carry the crawl, and that crawl's `id` SHALL equal the
requested id. A `not-found`, `invalid`, or `error` result SHALL carry the requested id.

A caller SHALL obtain a crawl only through this promise. It SHALL NOT read a crawl from a
file path or a direct data import. This restriction governs how a caller obtains a crawl,
not what a screen renders; a screen may still render URLs that the definition carries. The
crawl-shell capability names the shell as the single caller and passes the crawl to the
views as a prop.

#### Scenario: A known id resolves to the crawl

- **WHEN** a caller calls `getCrawl` with the id of an available crawl
- **THEN** the promise resolves to a `found` result whose crawl's `id` equals the requested id

#### Scenario: An unknown id resolves to not-found

- **WHEN** a caller calls `getCrawl` with an id that no record matches
- **THEN** the promise resolves to a `not-found` result carrying the requested id, without throwing or rejecting

#### Scenario: A retrieval failure resolves to an error

- **WHEN** the provider's underlying retrieval throws while resolving an id
- **THEN** the promise resolves to an `error` result carrying the requested id, without throwing or rejecting

### Requirement: Validate identity as data at the boundary

When the provider resolves a record, it SHALL validate the crawl's identity by type. The
crawl's `id` SHALL be the requested logical id. `title` is required and MUST be a string;
the provider SHALL NOT trim it or check its length, so an empty string is a valid title.
`date` and `color` are optional; when present, each MUST be a string, and the provider
SHALL reject `null` and any non-string value. A record whose identity fails any of these
checks SHALL resolve to `invalid`. The provider SHALL NOT interpret what `title`, `date`,
or `color` mean, and SHALL NOT resolve `color` to a palette.

#### Scenario: A missing title is invalid

- **WHEN** the provider resolves a record that has no `title`
- **THEN** the promise resolves to an `invalid` result carrying the requested id

#### Scenario: A non-string title is invalid

- **WHEN** the provider resolves a record whose `title` is present but not a string
- **THEN** the promise resolves to an `invalid` result

#### Scenario: A present but non-string date or color is invalid

- **WHEN** the provider resolves a record whose `date` or `color` is present but not a string, including `null`
- **THEN** the promise resolves to an `invalid` result

#### Scenario: Absent optional fields are still valid

- **WHEN** the provider resolves a record that has a string `title` but no `date` and no `color`
- **THEN** the promise resolves to a `found` result carrying that crawl

### Requirement: Carry the definition through unchanged

The provider SHALL carry the crawl's definition through unchanged. The definition holds
exactly the fields today's record has:

- the header title and route line;
- the schedule entries;
- the venue stops;
- the scavenger tasks and their rules;
- the map embed and viewer URLs;
- the Ventra, Metra, and album links.

The provider SHALL NOT interpret, reshape, add, or drop definition fields. It SHALL NOT
validate definition content.

#### Scenario: The found crawl exposes its definition unchanged

- **WHEN** a caller reads a `found` crawl's schedule, venues, scavenger tasks, map URLs, and links
- **THEN** each value matches the source record with no reshaping

#### Scenario: Color stays an unresolved name

- **WHEN** a `found` crawl carries a `color`
- **THEN** the provider exposes it as the authored string, not a resolved palette

### Requirement: A found result guarantees identity, not the definition

A `found` result SHALL guarantee only that the crawl's identity is present and correctly
typed. It SHALL NOT guarantee the definition is well-formed. In this release the definition
comes from the trusted in-repo record. A later story that loads definitions from outside
the repo SHALL validate them in the layer that owns their meaning.

#### Scenario: Valid identity with a malformed definition still resolves to found

- **WHEN** the provider resolves a record with valid identity but a malformed definition, such as a null scavenger list
- **THEN** the promise resolves to a `found` result, because the provider does not validate the definition

### Requirement: Expose the in-repo crawl by its id

The in-repo provider SHALL expose today's single record as one crawl, keyed by the logical
id `cory-trent`. Resolving `cory-trent` SHALL return that crawl. Resolving any other id
SHALL resolve to `not-found`.

#### Scenario: The seed crawl resolves by its id

- **WHEN** a caller calls `getCrawl` with the id `cory-trent`
- **THEN** the promise resolves to a `found` result whose crawl's `id` is `cory-trent`

#### Scenario: Another id is not found

- **WHEN** a caller calls `getCrawl` with an id other than `cory-trent`
- **THEN** the promise resolves to a `not-found` result
