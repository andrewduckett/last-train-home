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

### Requirement: Checklist persists on the device

The shell SHALL persist the checklist on the device so that reopening the app restores the checks. It SHALL read the checks stored by the pre-migration app under the same storage key. When device storage is unavailable, the shell SHALL keep working in memory without failing.

#### Scenario: Checks persist across reloads

- **WHEN** a participant checks tasks and later reopens the app on the same device
- **THEN** the previously checked tasks remain checked

#### Scenario: Existing pre-migration checks load

- **WHEN** the device already holds checks the pre-migration app saved under its storage key
- **THEN** the shell shows those tasks as checked

#### Scenario: Unreadable storage does not break the app

- **WHEN** stored checks are missing or malformed, or storage access throws
- **THEN** the shell starts with no checks and continues to work

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

The shell SHALL obtain its crawl from the provider with the default id, `cory-trent`. It
SHALL resolve the crawl once and pass it to the four views as a prop. A view SHALL NOT call
the provider. While the result is pending, the shell SHALL show a loading state and SHALL NOT
mount the views. For a `found` result, it SHALL render the views from that crawl. For
`not-found`, `invalid`, or `error`, it SHALL show a fallback and SHALL NOT mount views.

#### Scenario: The default crawl resolves and the Schedule view shows its content

- **WHEN** the shell resolves `cory-trent` with the Schedule tab active
- **THEN** the header shows the seed `appTitle` and `line`, and Schedule lists entries in authored order

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

- **WHEN** a participant switches between tabs after the crawl resolves
- **THEN** the shell uses the resolved crawl and calls the provider once

#### Scenario: A non-found result shows a fallback

- **WHEN** the provider resolves to `not-found`, `invalid`, or `error`
- **THEN** the shell shows a fallback message and does not mount the views

#### Scenario: A pending result shows a loading state

- **WHEN** the crawl promise has not yet resolved
- **THEN** the shell shows a loading state and does not mount the views
