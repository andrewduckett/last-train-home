## ADDED Requirements

### Requirement: Use descriptive venue and scavenger keys

Each venue place SHALL have a string `name` and a string `address`. Each scavenger task SHALL have a string `id`, a string `title`, a finite number `points`, and a string `description`. The build SHALL reject a place that contains `n` or `a`. It SHALL reject a task that contains `t`, `p`, or `d`. Each rejection SHALL identify the record, the old field, and the key that replaces it.

#### Scenario: A crawl uses the descriptive keys

- **WHEN** every place has `name` and `address`, and every task has `id`, `title`, `points`, and `description`
- **THEN** build validation accepts the crawl

#### Scenario: A place keeps an old one-letter key

- **WHEN** a venue place contains `n` or `a`
- **THEN** build validation fails, identifies that place's old field, and names `name` or `address` as its replacement

#### Scenario: A task keeps an old one-letter key

- **WHEN** a scavenger task contains `t`, `p`, or `d`
- **THEN** build validation fails, identifies that task's old field, and names `title`, `points`, or `description` as its replacement

#### Scenario: A descriptive field has the wrong type

- **WHEN** a place's `address` or a task's `title` or `description` is not a string, or a task's `points` is not a finite number
- **THEN** build validation fails and identifies that field by its descriptive key

#### Scenario: Saved checks survive the rename

- **WHEN** a crawler checked tasks before the rename and opens the renamed seed crawl
- **THEN** each task keeps its `id`, and the Tasks tab shows the same tasks as checked

## MODIFIED Requirements

### Requirement: Enforce current rendering invariants

The build SHALL reject definitions that violate the current views' keyed-list and score requirements. Venue stop labels SHALL be unique. Place `name` values SHALL be unique within each venue. Scavenger task ids SHALL be unique. Scavenger `points` SHALL produce a finite total greater than zero.

#### Scenario: A rendered key is duplicated

- **WHEN** a record repeats a venue stop label, a place `name` within one venue, or a scavenger task id
- **THEN** crawl validation fails and identifies the record and duplicated field

#### Scenario: Task points cannot produce a usable tally

- **WHEN** a record's scavenger `points` produce a non-finite or non-positive total
- **THEN** crawl validation fails and identifies the record and the `points` field
