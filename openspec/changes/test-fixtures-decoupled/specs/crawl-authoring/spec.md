## ADDED Requirements

### Requirement: Check authored crawls by contract, not content

Verification SHALL check every authored crawl record against the crawl contract. A record meets the contract when it passes build validation and the in-repo provider resolves its logical id to found. Verification SHALL NOT compare an authored record's title, text, links, places, tasks, or color with fixed expected values. Behavior checks SHALL use generated crawls that copy no authored record's content.

#### Scenario: An author edits a crawl's content

- **WHEN** the contract check runs on a valid record, whatever its title, introduction, links, schedule, places, tasks, or color
- **THEN** the check passes

#### Scenario: An author adds a crawl

- **WHEN** the crawl directory holds a valid record that no test names
- **THEN** the contract check finds that record and checks it

#### Scenario: An authored record breaks the contract

- **WHEN** an authored record fails build validation or does not resolve to found through the provider
- **THEN** verification fails and identifies the record

#### Scenario: The configured default crawl is missing

- **WHEN** no authored record matches the configured default logical id
- **THEN** verification fails and identifies the default logical id

## MODIFIED Requirements

### Requirement: Use descriptive place and scavenger keys

Each crawl definition SHALL have a `places` list, which MAY be empty. Each entry in `places` SHALL have a string `stop`, a string `town`, and a `locations` list with at least one location. Each location SHALL have a string `name` and a string `address`. A location MAY have a `label`, which SHALL be a non-empty string when present. Each scavenger task SHALL have a string `id`, a string `title`, a finite number `points`, and a string `description`.

The build SHALL reject each retired key below. Each rejection SHALL identify the record, the old field, and the key that replaces it.

- `definition.venues`: use `places`.
- A `places` list inside a stop: use `locations`.
- `n` or `a` on a location: use `name` or `address`.
- `t`, `p`, or `d` on a task: use `title`, `points`, or `description`.

#### Scenario: A crawl uses the descriptive keys

- **WHEN** every stop has `stop`, `town`, and at least one location, every location has `name` and `address`, and every task has `id`, `title`, `points`, and `description`
- **THEN** build validation accepts the crawl

#### Scenario: A crawl lists no places

- **WHEN** a definition has an empty `places` list
- **THEN** build validation accepts the crawl

#### Scenario: A crawl keeps the old venues list

- **WHEN** a definition contains `venues`
- **THEN** build validation fails, identifies `definition.venues`, and names `places` as its replacement

#### Scenario: A stop keeps its old places list

- **WHEN** a stop in `places` contains a `places` list
- **THEN** build validation fails, identifies that stop's old field, and names `locations` as its replacement

#### Scenario: A stop has no locations

- **WHEN** a stop's `locations` list is empty or missing
- **THEN** build validation fails and identifies that stop's `locations` field

#### Scenario: A location has a label

- **WHEN** a location has a non-empty string `label`
- **THEN** build validation accepts the location

#### Scenario: A label is blank or not text

- **WHEN** a location's `label` is blank, a number, a list, or an object
- **THEN** build validation fails and identifies that location's `label` field

#### Scenario: A place keeps an old one-letter key

- **WHEN** a location contains `n` or `a`
- **THEN** build validation fails, identifies that location's old field, and names `name` or `address` as its replacement

#### Scenario: A task keeps an old one-letter key

- **WHEN** a scavenger task contains `t`, `p`, or `d`
- **THEN** build validation fails, identifies that task's old field, and names `title`, `points`, or `description` as its replacement

#### Scenario: A descriptive field has the wrong type

- **WHEN** a stop's `stop` or `town`, a location's `name` or `address`, or a task's `title` or `description` is not a string, or a task's `points` is not a finite number
- **THEN** build validation fails and identifies that field by its descriptive key

#### Scenario: Saved checks survive the rename

- **WHEN** a crawler has saved checks for a crawl and an author later edits that crawl's task titles, points, or descriptions but keeps each task's `id`
- **THEN** the Tasks tab shows the same tasks as checked

### Requirement: Validate album links through the quick-link list

The build SHALL accept a crawl without an album link. It SHALL accept a group album in `definition.links` under the same rules as other quick links. The build SHALL reject the obsolete `definition.albumUrl` field so an author does not publish an invisible album destination.

#### Scenario: The seed has no album destination

- **WHEN** a crawl has quick links but none of them is an album
- **THEN** build validation accepts its link list

#### Scenario: An organizer adds an album link

- **WHEN** an organizer adds an album label and valid HTTP or HTTPS URL to `definition.links`
- **THEN** build validation accepts that link under the existing link rules

#### Scenario: An album link uses an unsafe URL

- **WHEN** an album link uses a URL scheme other than HTTP or HTTPS
- **THEN** build validation fails and identifies that link's URL field

#### Scenario: An old album field remains

- **WHEN** an authored crawl contains `definition.albumUrl`
- **THEN** build validation fails and identifies `definition.albumUrl`
