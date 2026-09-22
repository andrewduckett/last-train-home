## Purpose

Crawl authoring prevents an organizer from publishing YAML that the current app cannot render. It keeps hand-edited records safe without moving definition validation into the runtime provider.

## ADDED Requirements

### Requirement: Validate every crawl before publication

The build SHALL parse every YAML **crawl** record and validate the fields required by the current views. It SHALL fail before deployment when any record is malformed or unsafe to render.

#### Scenario: Every authored record is valid

- **WHEN** the build checks the static crawl directory and every record matches the current renderable shape
- **THEN** crawl validation passes

#### Scenario: A definition field has the wrong type

- **WHEN** any authored record contains a value that a current view cannot safely render
- **THEN** crawl validation fails and identifies the record and field

#### Scenario: YAML syntax is invalid

- **WHEN** any authored record cannot be parsed as YAML
- **THEN** crawl validation fails and identifies the record

### Requirement: Keep provider validation limited to identity

Build validation SHALL NOT change the runtime **provider** contract. The **provider** SHALL continue to validate **identity** and carry the **definition** through unchanged.

#### Scenario: Runtime provider reads a build-validated record

- **WHEN** the runtime **provider** resolves an authored record
- **THEN** it applies the existing **identity** checks without repeating definition validation

