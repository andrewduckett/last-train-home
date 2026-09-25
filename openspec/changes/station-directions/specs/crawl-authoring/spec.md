## RENAMED Requirements

- FROM: `### Requirement: Use descriptive venue and scavenger keys`
- TO: `### Requirement: Use descriptive place and scavenger keys`

## MODIFIED Requirements

### Requirement: Enforce current rendering invariants

The build SHALL reject definitions that violate the current views' keyed-list and score requirements. Stop labels in `places` SHALL be unique. Location `name` values SHALL be unique within each stop. Scavenger task ids SHALL be unique. Scavenger `points` SHALL produce a finite total greater than zero.

#### Scenario: A rendered key is duplicated

- **WHEN** a record repeats a stop label in `places`, a location `name` within one stop, or a scavenger task id
- **THEN** crawl validation fails and identifies the record and duplicated field

#### Scenario: Task points cannot produce a usable tally

- **WHEN** a record's scavenger `points` produce a non-finite or non-positive total
- **THEN** crawl validation fails and identifies the record and the `points` field

### Requirement: Use descriptive place and scavenger keys

Each crawl definition SHALL have a `places` list. Each entry in `places` SHALL have a string `stop`, a string `town`, and a `locations` list with at least one location. Each location SHALL have a string `name` and a string `address`. A location MAY have a `label`, which SHALL be a non-empty string when present. Each scavenger task SHALL have a string `id`, a string `title`, a finite number `points`, and a string `description`.

The build SHALL reject each retired key and SHALL name the key that replaces it:

- `definition.venues`, replaced by `places`;
- a `places` list inside a stop, replaced by `locations`;
- `n` or `a` on a location, replaced by `name` or `address`;
- `t`, `p`, or `d` on a task, replaced by `title`, `points`, or `description`.

Each rejection SHALL identify the record, the old field, and the key that replaces it.

#### Scenario: A crawl uses the descriptive keys

- **WHEN** every stop has `stop`, `town`, and at least one location, every location has `name` and `address`, and every task has `id`, `title`, `points`, and `description`
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

- **WHEN** a crawler checked tasks before the rename and opens the renamed seed crawl
- **THEN** each task keeps its `id`, and the Tasks tab shows the same tasks as checked
