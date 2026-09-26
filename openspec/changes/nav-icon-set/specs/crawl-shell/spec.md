## ADDED Requirements

### Requirement: Shell icons

The shell SHALL draw its tab and header icons from the app's own icon set, not from emoji. Every icon in the set SHALL share one stroke weight and one line style. The Schedule tab SHALL show a clock. The Places tab SHALL show a map pin. The Tasks tab SHALL show a checklist. The Info tab SHALL show an information mark. The header SHALL show a train beside the crawl title.

Each tab icon SHALL take the color of its tab's label. The active tab's icon SHALL use the crawl's board accent. Each inactive tab's icon SHALL use the board's muted color, at full opacity. The header icon SHALL use the board's ink color.

The icons SHALL be decorative. Assistive technology SHALL skip them, and each tab's text label SHALL stay its accessible name. The shell SHALL ship the icons in its own bundle, so they load with no extra network request.

#### Scenario: Each tab shows its icon

- **WHEN** a participant opens a crawl with Info content
- **THEN** Schedule shows a clock, Places a map pin, Tasks a checklist, and Info an information mark
- **THEN** the tab bar shows no emoji

#### Scenario: The header shows a train

- **WHEN** a participant opens any crawl
- **THEN** the header shows the train icon beside the crawl title, and no emoji

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
- **THEN** the shell draws every icon without requesting an icon file or any other resource
