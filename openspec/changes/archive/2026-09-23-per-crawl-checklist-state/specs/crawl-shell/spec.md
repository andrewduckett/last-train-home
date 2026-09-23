## ADDED Requirements

### Requirement: Per-crawl checklist persists on the device

The shell SHALL persist each crawl's checklist on the device under `crawl-checks:<id>`, using that crawl's logical id. Reopening a crawl SHALL restore only its own current tasks. The shell SHALL treat only a stored value of `true` as checked. It SHALL ignore stored task ids absent from the current crawl. When device storage is unavailable, the checklist SHALL continue to work in memory across tab changes.

#### Scenario: Checks persist across reloads

- **WHEN** a participant checks a task and reopens the same crawl on the same device
- **THEN** the task remains checked and the tally includes its points

#### Scenario: Crawls with matching task ids remain separate

- **WHEN** a participant checks a task in one crawl and opens another crawl with the same task id
- **THEN** the second crawl starts with its own saved check state

#### Scenario: Removed tasks do not return

- **WHEN** a crawl's saved checks include a task id missing from its current definition
- **THEN** the missing task does not appear in the checklist or contribute to the tally
- **THEN** later saves for that crawl exclude the missing task id

#### Scenario: Old global checks are not imported

- **WHEN** the device holds only checks under `crawl-checks-v1`
- **THEN** a crawl starts with no checked tasks

#### Scenario: Unreadable storage does not break the app

- **WHEN** stored checks are missing or malformed, or storage access throws
- **THEN** the shell starts with no checks and continues to work

#### Scenario: Storage failures do not lose checks on a tab change

- **WHEN** a participant checks a task while storage writes fail, switches tabs, and returns to Tasks
- **THEN** the task remains checked and the tally includes its points for that session

#### Scenario: A fresh Tasks view reads newer saved checks

- **WHEN** another tab saves a check while the participant views Schedule, and this shell has no unsaved edits
- **WHEN** the participant returns to Tasks
- **THEN** the Tasks view shows the newly saved check

#### Scenario: Only true saved values count as checked

- **WHEN** saved checks contain `false`, strings, or other non-true values for current task ids
- **THEN** those tasks appear unchecked and contribute no earned points

#### Scenario: Prototype properties do not count as checked

- **WHEN** a task id matches an object prototype property name such as `toString` or `constructor`
- **THEN** the task is checked only if its own saved value is literal `true`

## REMOVED Requirements

### Requirement: Checklist persists on the device

**Reason**: The old requirement couples every crawl to one global storage key and promises a legacy import that nobody needs.

**Migration**: Replace it with per-crawl checklist persistence under `crawl-checks:<id>`. Ignore `crawl-checks-v1`.
