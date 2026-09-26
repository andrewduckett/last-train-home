# Crawl Shell Specification

## Purpose

The crawl shell is the phone screen a participant uses on the day. It renders one crawl across Schedule, Places, and Tasks. An Info tab appears when the crawl has an introduction or a valid quick link.

## Requirements

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

### Requirement: Schedule timeline

The Schedule view SHALL show valid timed `stop`, `move`, and `note` entries in authored order. Each entry SHALL show its time and title. It SHALL show an authored tag when present and a kind-based tag otherwise. A move SHALL show its authored mode without limiting that text to known transit types. Each entry SHALL show its optional note; a move SHALL show its mode before that note. The view SHALL distinguish moves, stops, and notes visually. An invalid entry SHALL be omitted without hiding valid entries or failing the crawl page.

#### Scenario: Timeline renders in order

- **WHEN** the Schedule view receives valid stop, move, and note entries
- **THEN** it lists them in authored order with their times, titles, tags, and available details

#### Scenario: A walking move uses author text

- **WHEN** a move has `mode: 15 min walk to the next stop`
- **THEN** the timeline shows that text without replacing it with a train label

#### Scenario: One entry is malformed at runtime

- **WHEN** a schedule contains an entry without a valid kind or required text
- **THEN** the timeline omits that entry and continues to show valid entries

#### Scenario: The schedule container is missing at runtime

- **WHEN** the resolved crawl has no schedule list
- **THEN** the Schedule view shows an unavailable message and the other crawl tabs remain usable

### Requirement: Place list with directions

The Places view SHALL list each stop in authored order, with its stop label and town. Under each stop, it SHALL list that stop's locations in authored order. Each location SHALL show its name and address. When a location has a label, the view SHALL show the label as a tag beside the name. The view SHALL NOT mark the locations at one stop as alternatives to each other.

Each location SHALL show a directions link that opens a map search. The search query SHALL be the location's name, its street address, and its stop's town, as authored, separated by a comma and a space. The app SHALL NOT add any other text to the query, such as a state or a label. The app SHALL percent-encode the query, so authored characters such as `&`, `=`, `#`, and `?` stay inside the query parameter.

On an Apple device, the link SHALL open an Apple Maps search at `https://maps.apple.com/` with the query in its `q` parameter, in the same browser tab. An Apple device is one whose user agent names an iPhone, iPad, iPod, or Macintosh. On any other device, the link SHALL open a Google Maps search in a new browser tab. The same rule SHALL apply when the app cannot read the user agent. The Google link SHALL use `https://www.google.com/maps/search/?api=1` with the query in its `query` parameter.

#### Scenario: Directions link opens a map search

- **WHEN** the Places view renders on a non-Apple device
- **THEN** each directions link has a Google Maps search `href`, `target="_blank"`, and `rel="noopener noreferrer"`

#### Scenario: An Apple Maps link opens in the same tab

- **WHEN** the Places view renders on an Apple device
- **THEN** each directions link has an Apple Maps search `href` and no `target` attribute

#### Scenario: An iPhone gets Apple Maps

- **WHEN** a participant whose user agent names an iPhone opens the Places view
- **THEN** each directions link is an Apple Maps search for that location's query

#### Scenario: An iPad in desktop mode gets Apple Maps

- **WHEN** a participant's iPad reports a Macintosh user agent
- **THEN** each directions link is an Apple Maps search for that location's query

#### Scenario: An Android phone gets Google Maps

- **WHEN** a participant whose user agent names Android opens the Places view
- **THEN** each directions link is a Google Maps search for that location's query

#### Scenario: The device cannot be identified

- **WHEN** the app cannot read a user agent
- **THEN** each directions link is a Google Maps search for that location's query

#### Scenario: The query carries only authored text

- **WHEN** a crawl outside Illinois lists a location named `Canal Cafe`, labeled `Cafe`, at `7 River Rd`, in a stop whose town is `River Town`
- **THEN** the directions query is exactly `Canal Cafe, 7 River Rd, River Town`

#### Scenario: Authored punctuation stays in the query

- **WHEN** a location is named `Pub & Grill #2?`
- **THEN** its directions link keeps the whole name inside the query parameter and adds no other parameter or fragment

#### Scenario: A label shows as a tag

- **WHEN** a location has the label `Train`
- **THEN** the view shows `Train` as a tag beside that location's name

#### Scenario: A location without a label shows no tag

- **WHEN** a location has no label
- **THEN** the view shows that location's name with no tag

#### Scenario: Locations at one stop are not alternatives

- **WHEN** a stop has two or more locations
- **THEN** the view lists them in authored order with no "OR" divider between them

#### Scenario: A stop holds a single location

- **WHEN** a stop lists only one location, such as a meetup point
- **THEN** the view shows that stop's card with that one location and its directions link

#### Scenario: The seed keeps its Google searches

- **WHEN** a participant on a non-Apple device opens the Places view for any crawl, including the default crawl
- **THEN** each location's directions link is the Google Maps search for that location's query, built only from its authored text

#### Scenario: The seed shows its stations

- **WHEN** a crawl's stops each list a location labeled `Train` before a location labeled `Bar`
- **THEN** each stop's card shows the `Train` location first and the `Bar` location second, each with its tag

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

### Requirement: Quick links

The Info view SHALL show the crawl's valid quick links in authored order. Each link SHALL show its label and optional hint, and open its destination in a new browser tab. A missing, invalid, or empty link list SHALL leave no link cards. The view SHALL omit a link without required text or with an unsafe URL while keeping valid siblings. The Schedule view SHALL start with the timeline and SHALL NOT show link cards. An album link SHALL use the same format and behavior as any other quick link. The view SHALL NOT create a clickable link from an unsafe URL. A route map is an ordinary quick link.

#### Scenario: Quick link opens externally

- **WHEN** a participant taps a quick link in Info
- **THEN** the browser opens that link's configured destination in a new tab

#### Scenario: A crawl has no quick links

- **WHEN** the crawl's link list is empty and its introduction is present
- **THEN** Info shows the introduction without link cards

#### Scenario: The link list is malformed at runtime

- **WHEN** the resolved crawl has a non-array link list and a valid introduction
- **THEN** Info shows the introduction without link cards, and Schedule remains usable

#### Scenario: One link lacks a label

- **WHEN** one authored link lacks a label beside a valid link
- **THEN** Info omits the malformed link and shows the valid link

#### Scenario: Several links fit a phone screen

- **WHEN** a crawl has at least three quick links on a portrait phone
- **THEN** each card keeps readable text and a full-card tap target without horizontal overflow

#### Scenario: Album link uses the common link format

- **WHEN** an author adds a group album to the crawl's link list
- **THEN** Info shows it in authored order with the same behavior as other links
- **THEN** Tasks shows no separate album button

#### Scenario: A URL is unsafe at runtime

- **WHEN** a quick link URL uses an unsafe scheme
- **THEN** Info omits the unsafe quick link and keeps valid sibling links


#### Scenario: A route map is a quick link

- **WHEN** an author adds a route map URL to the crawl's link list
- **THEN** Info shows it as a quick link that opens in a new tab, and no view embeds it in a frame

### Requirement: Phone-first shell layout

The shell SHALL target a portrait phone used one-handed. It SHALL keep the header and bottom navigation fixed while content scrolls, respect safe-area insets, and make each tab and each checklist row a full-row or full-cell tap target. It SHALL follow the system light or dark setting through `prefers-color-scheme`, with no in-app toggle, and reduce motion when the device requests it.

#### Scenario: Dark mode follows the system

- **WHEN** the device is set to dark mode
- **THEN** the shell renders its dark palette without any in-app toggle

#### Scenario: Reduced motion is honored

- **WHEN** the device requests reduced motion
- **THEN** the shell disables its transitions and animations

#### Scenario: Four tabs fit a portrait phone

- **WHEN** the Info tab is visible at a 320 CSS pixel viewport width
- **THEN** every label is fully visible, every tab has a tap target of at least 44 by 44 CSS pixels, and the page has no horizontal overflow

### Requirement: Resolve the crawl before a view renders

The route SHALL give the shell its selected logical id. The shell SHALL obtain that crawl from the provider for each route selection. It SHALL pass the resolved crawl to the active view. A view SHALL NOT call the provider. While a result is pending, the shell SHALL show a loading state and SHALL NOT mount the views. For a found result, it SHALL render that crawl. For not-found, invalid, or error, it SHALL show a fallback and SHALL NOT mount views. A stale result SHALL NOT replace a newer route selection.

#### Scenario: The default crawl resolves and the Schedule view shows its content

- **WHEN** the shell resolves any crawl, including the default crawl, with the Schedule tab active
- **THEN** the header shows that crawl's appTitle and line, and Schedule lists its entries in authored order

#### Scenario: The Venues tab shows the seed venues

- **WHEN** the resolved shell opens the Places tab
- **THEN** the view shows each of that crawl's locations with its name, address, label, and directions link

#### Scenario: The Tasks tab shows the seed tasks

- **WHEN** the resolved shell opens the Tasks tab
- **THEN** the view lists each of that crawl's scavenger tasks with its points

#### Scenario: The Info tab shows the seed route map link

- **WHEN** the resolved shell opens the Info tab for a crawl whose quick links include a route map
- **THEN** it shows that link with its authored label, and the link opens its authored destination

#### Scenario: The Info tab shows the seed content

- **WHEN** the resolved shell opens the Info tab
- **THEN** it shows that crawl's introduction and its quick links in authored order, each opening its authored destination

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

### Requirement: Crawl introduction

The Info view SHALL show a crawl's optional introduction when it is a string with non-whitespace text. It SHALL preserve Unicode text, including emoji. A missing, blank, or malformed introduction SHALL leave no introduction text and SHALL NOT prevent the crawl from loading.

The Info view SHALL render a small set of authored formatting:

- A blank line SHALL start a new paragraph. A line that holds only whitespace SHALL count as blank.
- A single line break inside a paragraph SHALL show as a line break.
- Text between `**` markers SHALL show as bold. Text between `*` markers SHALL show as italic. Text between `***` markers SHALL show as bold and italic.
- A marker SHALL count only when it touches its text. An opening marker SHALL have a non-whitespace character right after it. A closing marker SHALL have a non-whitespace character right before it.
- Markers SHALL pair only within one line.
- A run of more than 3 asterisks SHALL stay entirely as literal text.
- Any asterisk left without a partner SHALL stay as literal text.

The Info view SHALL show all other markup as literal text, including HTML tags. Unusual or unbalanced formatting SHALL NOT prevent the introduction or the crawl from rendering.

#### Scenario: The seed introduction appears

- **WHEN** a participant opens Info for a crawl whose introduction has three blocks of text and one `**` bold phrase
- **THEN** the view shows the introduction as three paragraphs
- **AND** the bold phrase appears in bold without asterisks

#### Scenario: A blank line separates paragraphs

- **WHEN** an introduction has two blocks of text separated by a blank line or a whitespace-only line
- **THEN** Info shows two paragraphs

#### Scenario: A single line break stays inside the paragraph

- **WHEN** an introduction has two lines separated by one line break
- **THEN** Info shows one paragraph with a line break between the two lines

#### Scenario: Bold and italic markers render

- **WHEN** an introduction contains `**Bring ID**` and `*rain or shine*`
- **THEN** Info shows "Bring ID" in bold and "rain or shine" in italic, without asterisks

#### Scenario: Bold and italic combine

- **WHEN** an introduction contains `***last call***` or `**bold *both* bold**`
- **THEN** Info shows "last call" and "both" in bold and italic, and the rest of the bold phrase in bold

#### Scenario: Bold closes inside italic

- **WHEN** an introduction contains `*see you **there***`
- **THEN** Info shows "see you " in italic and "there" in bold and italic, without asterisks

#### Scenario: Markers inside a word render

- **WHEN** an introduction contains `Harbor*and*Mill`
- **THEN** Info shows "and" in italic between "Harbor" and "Mill", without asterisks

#### Scenario: Spaced asterisks stay literal

- **WHEN** an introduction contains `2 * 3 * 4 drinks`
- **THEN** Info shows `2 * 3 * 4 drinks` as written, without italic text

#### Scenario: A long asterisk run stays literal

- **WHEN** an introduction contains `****text****`
- **THEN** Info shows `****text****` as written, without bold or italic text

#### Scenario: An unmatched marker stays literal

- **WHEN** an introduction contains `**Bring a jacket` with no closing marker
- **THEN** Info shows `**Bring a jacket` as written, and the rest of the introduction renders

#### Scenario: Markers do not pair across lines

- **WHEN** an introduction has `**Meet` at the end of one line and `early**` at the start of the next
- **THEN** Info shows both markers as literal text

#### Scenario: HTML stays literal

- **WHEN** an introduction contains `Hello <strong>friends</strong>`
- **THEN** Info shows the tags as text and creates no element from them

#### Scenario: An introduction contains emoji

- **WHEN** an authored introduction contains emoji
- **THEN** Info shows those characters with the surrounding text

#### Scenario: The introduction is malformed at runtime

- **WHEN** the provider returns a non-string introduction with valid links
- **THEN** Info omits the introduction and keeps the links usable
