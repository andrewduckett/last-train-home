# Crawl Provider Specification

## Purpose

The crawl provider resolves a crawl by its stable logical id. It is the one place the app
reads a crawl from its source, so the source can change later without changing the screens.

## Requirements

### Requirement: Resolve a crawl through the provider

The provider SHALL expose `getCrawl(id: string): Promise<CrawlResult>` as the only way a
caller obtains a crawl. The promise SHALL resolve to exactly one result: `found`,
`not-found`, `invalid`, or `error`. The promise SHALL NOT reject, and the call SHALL NOT
throw. A `found` result SHALL carry a crawl whose `id` equals the requested id. All other
results SHALL carry the requested id. A caller SHALL obtain a crawl only through this promise.

#### Scenario: A known id resolves to the crawl

- **WHEN** a caller calls `getCrawl` with an available id
- **THEN** the promise resolves to a `found` result whose crawl id equals the requested id

#### Scenario: An unknown id resolves to not-found

- **WHEN** a caller calls `getCrawl` with an unknown id
- **THEN** the promise resolves to a `not-found` result with the requested id

#### Scenario: A retrieval failure resolves to an error

- **WHEN** retrieval throws while resolving an id
- **THEN** the promise resolves to an `error` result with the requested id

### Requirement: Validate identity as data at the boundary

The provider SHALL set a crawl's `id` from the requested logical id. `title` is required
and MUST be a string. The provider SHALL NOT trim it or check its length. `date` and
`color` are optional. When present, each MUST be a string. A record with invalid identity
SHALL resolve to `invalid`. The provider SHALL NOT interpret identity values or resolve
`color` to a palette.

#### Scenario: A missing title is invalid

- **WHEN** the provider resolves a record without a `title`
- **THEN** the promise resolves to an `invalid` result with the requested id

#### Scenario: A non-string title is invalid

- **WHEN** the provider resolves a record with a non-string `title`
- **THEN** the promise resolves to an `invalid` result

#### Scenario: A present but non-string date or color is invalid

- **WHEN** a record has a non-string `date` or `color`, including `null`
- **THEN** the promise resolves to an `invalid` result

#### Scenario: Absent optional fields are still valid

- **WHEN** a record has a string `title` but no `date` or `color`
- **THEN** the promise resolves to a `found` result

### Requirement: Carry the definition through unchanged

The provider SHALL carry the crawl definition through unchanged. The definition contains the
header, schedule, venues, scavenger tasks and rules, map URLs, and quick links. The provider
SHALL NOT interpret, reshape, add, drop, or validate definition fields.

#### Scenario: The found crawl exposes its definition unchanged

- **WHEN** a caller reads a found crawl's definition
- **THEN** each value matches the source record without reshaping

#### Scenario: Color stays an unresolved name

- **WHEN** a found crawl carries a `color`
- **THEN** the provider exposes the authored string, not a resolved palette

### Requirement: A found result guarantees identity, not the definition

A `found` result SHALL guarantee only that the crawl identity is present and correctly
typed. It SHALL NOT guarantee the definition is well formed. The trusted in-repo record
provides the definition in this release. A later source layer SHALL validate external
definitions in the layer that owns their meaning.

#### Scenario: Valid identity with a malformed definition still resolves to found

- **WHEN** the provider resolves valid identity with a malformed definition
- **THEN** the promise resolves to `found`

### Requirement: Expose the in-repo crawl by its id

The in-repo provider SHALL expose today's single record as `cory-trent`. Resolving
`cory-trent` SHALL return that crawl. Resolving every other id SHALL return `not-found`.

#### Scenario: The seed crawl resolves by its id

- **WHEN** a caller calls `getCrawl` with `cory-trent`
- **THEN** the promise resolves to a `found` result whose crawl id is `cory-trent`

#### Scenario: Another id is not found

- **WHEN** a caller calls `getCrawl` with another id
- **THEN** the promise resolves to a `not-found` result

