# Crawl Shell Specification

## Purpose

The crawl shell is the phone screen a participant uses on the day. It renders one crawl across four tabs — Schedule, Map, Venues, and Tasks — showing the schedule, venues, scavenger checklist, quick links, and map.

## Requirements

### Requirement: Four-tab navigation

The shell SHALL present four tabs — Schedule, Map, Venues, and Tasks — and show one view at a time. It SHALL open on the Schedule tab and mark the active tab.

#### Scenario: App opens on the Schedule tab

- **WHEN** a participant opens the app
- **THEN** the shell shows the Schedule view and marks the Schedule tab active

#### Scenario: Tapping a tab switches the view

- **WHEN** a participant taps a different tab
- **THEN** the shell shows that tab's view, marks it active, and scrolls the content to the top

### Requirement: Schedule timeline

The Schedule view SHALL render the crawl's timed entries as an ordered timeline. Each entry SHALL show its time, a short tag, and a title, plus an optional subtitle. The view SHALL mark departure entries distinctly from stop entries.

#### Scenario: Timeline renders in order

- **WHEN** the Schedule view renders
- **THEN** it lists every schedule entry in authored order, each showing time, tag, and title

### Requirement: Venue list with directions

The Venues view SHALL list each stop with its venue names and addresses. Each venue SHALL show a directions link that opens a map search in a new browser tab. The search query SHALL carry the venue's name, street address, town, and state, matching the pre-migration behavior.

#### Scenario: Directions link opens a map search

- **WHEN** a participant taps a venue's directions link
- **THEN** the browser opens, in a new tab, a Google Maps search URL whose query is the venue's name, street address, town, and `IL`

### Requirement: Scavenger checklist with points tally

The Tasks view SHALL list each scavenger task with its point value. Tapping a task SHALL toggle its check. The view SHALL show earned points, total points, and percent collected, where percent collected is `round(earned / total * 100)`.

#### Scenario: Checking a task updates the tally

- **WHEN** a participant checks a task worth 10 points, with 85 points total and none yet checked
- **THEN** earned points show 10 of 85 and percent collected shows 12

#### Scenario: Unchecking a task lowers the tally

- **WHEN** a participant unchecks a checked task
- **THEN** earned points and percent collected drop by that task's contribution

#### Scenario: Reset clears checks after confirmation

- **WHEN** a participant taps Reset and confirms
- **THEN** the shell clears every check in that list and the tally returns to 0 of 85

#### Scenario: Reset is abandoned on cancel

- **WHEN** a participant taps Reset and cancels the confirmation
- **THEN** the checks stay unchanged

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

### Requirement: Quick links and embedded map

The shell SHALL show the crawl's quick links, which open external destinations in a new browser tab. The Map view SHALL show an embedded map frame and a link that opens the crawl's map viewer URL in a new tab. Whether that link hands off to a native maps app depends on the participant's device.

#### Scenario: Quick link opens externally

- **WHEN** a participant taps a quick link
- **THEN** the browser opens that link's configured destination in a new tab

#### Scenario: Map view shows the embedded map and viewer link

- **WHEN** the Map view renders
- **THEN** it shows the embedded map frame and a link to the crawl's configured map viewer URL

### Requirement: Phone-first layout

The shell SHALL target a portrait phone used one-handed. It SHALL keep the header and bottom navigation fixed while content scrolls, respect safe-area insets, and make each tab and each checklist row a full-row or full-cell tap target. It SHALL follow the system light or dark setting through `prefers-color-scheme`, with no in-app toggle, and reduce motion when the device requests it.

#### Scenario: Dark mode follows the system

- **WHEN** the device is set to dark mode
- **THEN** the shell renders its dark palette without any in-app toggle

#### Scenario: Reduced motion is honored

- **WHEN** the device requests reduced motion
- **THEN** the shell disables its transitions and animations


### Requirement: Resolve the crawl before rendering views

The route SHALL give the shell its selected logical id. The shell SHALL obtain that crawl from the provider for each route selection. It SHALL pass the resolved crawl to the four views. A view SHALL NOT call the provider. While a result is pending, the shell SHALL show a loading state and SHALL NOT mount the views. For a found result, it SHALL render that crawl. For not-found, invalid, or error, it SHALL show a fallback and SHALL NOT mount views. A stale result SHALL NOT replace a newer route selection.

#### Scenario: The default crawl resolves and the Schedule view shows its content

- **WHEN** the shell resolves cory-trent with the Schedule tab active
- **THEN** the header shows the seed appTitle and line, and Schedule lists entries in authored order

#### Scenario: The Venues tab shows the seed venues

- **WHEN** the resolved shell opens the Venues tab
- **THEN** the view shows each seed venue's name, address, and directions link

#### Scenario: The Tasks tab shows the seed tasks

- **WHEN** the resolved shell opens the Tasks tab
- **THEN** the view lists each seed scavenger task with its points

#### Scenario: The Map tab shows the seed map URLs

- **WHEN** the resolved shell opens the Map tab
- **THEN** the embed src and viewer href match the seed map URLs

#### Scenario: Switching tabs does not re-resolve the crawl

- **WHEN** a participant switches between tabs for one selected crawl
- **THEN** the shell uses that resolved crawl and calls the provider once for that selection

#### Scenario: A non-found result shows a fallback

- **WHEN** the provider resolves to not-found, invalid, or error
- **THEN** the shell shows a fallback message and does not mount the views

#### Scenario: A pending result shows a loading state

- **WHEN** the crawl promise has not yet resolved
- **THEN** the shell shows a loading state and does not mount the views

#### Scenario: Changing the route loads the newly selected crawl

- **WHEN** a participant changes from one crawl URL to another in the same session
- **THEN** the shell loads the new logical id and renders the new crawl

#### Scenario: The shell receives the direct route id

- **WHEN** a participant opens a direct crawl path
- **THEN** the route gives that path's logical id to the shell

#### Scenario: An earlier request resolves last

- **WHEN** an earlier crawl request resolves after the route selects another crawl
- **THEN** the shell keeps the result for the latest route selection
