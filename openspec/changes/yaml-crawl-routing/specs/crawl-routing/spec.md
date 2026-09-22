## Purpose

Crawl routing gives participants a direct link to an authored outing. It also lets the organizer choose which outing appears at the root path.

## ADDED Requirements

### Requirement: Select a crawl by URL

The app SHALL select the configured default **logical id** at the root path. At a single-segment path, it SHALL select that segment as the **logical id**. Logical ids SHALL be case-sensitive and lowercase. The app SHALL obtain either **crawl** through the **provider**.

#### Scenario: Root path selects the default

- **WHEN** a participant opens the root path
- **THEN** the app resolves the configured default **logical id**

#### Scenario: Direct path selects its crawl

- **WHEN** a participant opens a path for an available **crawl**
- **THEN** the app resolves the **logical id** from that path

#### Scenario: Direct path survives a reload

- **WHEN** a participant reloads a direct **crawl** link
- **THEN** the app loads the same **crawl** after the static app shell opens

#### Scenario: Mixed-case path does not normalize

- **WHEN** a participant opens a direct path containing uppercase letters
- **THEN** the app shows the not-found state without changing the path or loading a different **crawl**

### Requirement: Keep crawl discovery by direct link

The root path SHALL render the default **crawl**. The app SHALL NOT publish a page that lists every available **crawl**.

#### Scenario: Root path has no crawl directory

- **WHEN** a participant opens the root path
- **THEN** the participant sees the default **crawl** without a list of other crawls
