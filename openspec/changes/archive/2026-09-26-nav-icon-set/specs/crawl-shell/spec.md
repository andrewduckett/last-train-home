## ADDED Requirements

### Requirement: Shell icons

The shell SHALL draw its tab and header icons from the app's own icon set, not from emoji. Every icon in the set SHALL share one stroke weight and one line style. The Schedule tab SHALL show a clock. The Places tab SHALL show a map pin. The Tasks tab SHALL show a checklist. The Info tab SHALL show an information mark. The header SHALL show a train beside the crawl's app title.

Each tab icon SHALL take the color of its tab's label. The active tab's icon SHALL use the crawl's board accent. Each inactive tab's icon SHALL use the board's muted color, at full opacity. The header icon SHALL use the board's ink color.

The icons SHALL be decorative. Assistive technology SHALL skip them, and each tab's text label SHALL stay its accessible name. The shell SHALL ship the icons in its own bundle. Drawing an icon SHALL NOT request a file.

#### Scenario: Each tab shows its icon

- **WHEN** a participant opens a crawl with Info content
- **THEN** Schedule shows a clock, Places a map pin, Tasks a checklist, and Info an information mark
- **THEN** the tab bar shows no emoji

#### Scenario: The header shows a train

- **WHEN** a participant opens any crawl
- **THEN** the header shows the train icon beside the crawl's app title, and no emoji

#### Scenario: The active icon takes the accent

- **WHEN** a participant opens Places on a crawl whose color is `amber`
- **THEN** the Places icon shows in the amber board accent, the same color as its label
- **THEN** the other tab icons show in the board's muted color, at full opacity

#### Scenario: A crawl without a valid color uses the neutral accent

- **WHEN** a participant opens a crawl with no color or an unknown color name
- **THEN** the active tab's icon shows in the neutral board accent

#### Scenario: Screen readers hear only the tab labels

- **WHEN** a screen reader user moves through the tab bar
- **THEN** each tab announces its text label, and no icon adds its own name

#### Scenario: Icons load with the app

- **WHEN** a participant opens a crawl
- **THEN** the shell draws every icon without requesting an icon file

## MODIFIED Requirements

### Requirement: Tab navigation

The shell SHALL always present Schedule, Places, and Tasks. It SHALL NOT present a Map tab. It SHALL add Info after those tabs only when the crawl has an introduction string with non-whitespace text or a valid quick link. The shell SHALL show one view at a time. It SHALL open on Schedule and mark the active tab. Each new crawl selection SHALL reset the active tab to Schedule.

#### Scenario: The shell has no Map tab

- **WHEN** a participant opens any crawl
- **THEN** the tab bar shows Schedule, Places, and Tasks, and no Map tab

#### Scenario: App opens on the Schedule tab

- **WHEN** a participant opens the app
- **THEN** the shell shows the Schedule view and marks the Schedule tab active

#### Scenario: Tapping a tab switches the view

- **WHEN** a participant taps a different tab
- **THEN** the shell shows that tab's view, marks it active, and scrolls the content to the top

#### Scenario: The Places tab replaces Venues

- **WHEN** a participant opens any crawl
- **THEN** the tab bar shows a Places tab with a map pin icon, and no Venues tab

#### Scenario: A crawl has Info content

- **WHEN** a crawl has an introduction string with non-whitespace text or at least one valid quick link
- **THEN** the shell shows Info as its fourth tab

#### Scenario: A crawl has no Info content

- **WHEN** a crawl has no introduction string with non-whitespace text and no valid quick link
- **THEN** the shell shows only Schedule, Places, and Tasks

#### Scenario: A blank or malformed introduction does not create Info

- **WHEN** a crawl has a whitespace-only or non-string introduction and no valid quick links
- **THEN** the shell shows only Schedule, Places, and Tasks

#### Scenario: A new crawl omits Info while Info is active

- **WHEN** a participant opens another crawl without Info while viewing Info on the previous crawl
- **THEN** the shell selects Schedule for the new crawl and shows no Info tab
