# Crawl Shell Specification

## Purpose

The crawl shell is the phone screen a participant uses on the day. It renders one crawl across Schedule, Map, Venues, and Tasks. An Info tab appears when the crawl has an introduction or a valid quick link.

## Requirements

### Requirement: Four-tab navigation

The shell SHALL always present Schedule, Map, Venues, and Tasks. It SHALL add Info after those tabs only when the crawl has an introduction string with non-whitespace text or a valid quick link. The shell SHALL show one view at a time. It SHALL open on Schedule and mark the active tab. Each new crawl selection SHALL reset the active tab to Schedule.

#### Scenario: App opens on the Schedule tab

- **WHEN** a participant opens the app
- **THEN** the shell shows the Schedule view and marks the Schedule tab active

#### Scenario: Tapping a tab switches the view

- **WHEN** a participant taps a different tab
- **THEN** the shell shows that tab's view, marks it active, and scrolls the content to the top

#### Scenario: A crawl has Info content

- **WHEN** a crawl has an introduction string with non-whitespace text or at least one valid quick link
- **THEN** the shell shows Info as its fifth tab

#### Scenario: A crawl has no Info content

- **WHEN** a crawl has no introduction string with non-whitespace text and no valid quick link
- **THEN** the shell shows only Schedule, Map, Venues, and Tasks

#### Scenario: A blank or malformed introduction does not create Info

- **WHEN** a crawl has a whitespace-only or non-string introduction and no valid quick links
- **THEN** the shell shows only Schedule, Map, Venues, and Tasks

#### Scenario: A new crawl omits Info while Info is active

- **WHEN** a participant opens another crawl without Info while viewing Info on the previous crawl
- **THEN** the shell selects Schedule for the new crawl and shows no Info tab

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

### Requirement: Venue list with directions

The Venues view SHALL list each stop with its venue names and addresses. Each venue SHALL show a directions link that opens a map search. The search query SHALL be the venue's name, street address, and town, as authored, separated by a comma and a space. The app SHALL NOT add any other text to the query, such as a state.

On an Apple device, the link SHALL open an Apple Maps search at `https://maps.apple.com/` with the query in its `q` parameter, in the same browser tab. An Apple device is one whose user agent names an iPhone, iPad, iPod, or Macintosh. On any other device, the link SHALL open a Google Maps search in a new browser tab. The same rule SHALL apply when the app cannot read the user agent. The Google link SHALL use `https://www.google.com/maps/search/?api=1` with the query in its `query` parameter.

#### Scenario: Directions link opens a map search

- **WHEN** the Venues view renders on a non-Apple device
- **THEN** each directions link has a Google Maps search `href`, `target="_blank"`, and `rel="noopener noreferrer"`

#### Scenario: An Apple Maps link opens in the same tab

- **WHEN** the Venues view renders on an Apple device
- **THEN** each directions link has an Apple Maps search `href` and no `target` attribute

#### Scenario: An iPhone gets Apple Maps

- **WHEN** a participant whose user agent names an iPhone opens the Venues view
- **THEN** each directions link is an Apple Maps search for that venue's query

#### Scenario: An iPad in desktop mode gets Apple Maps

- **WHEN** a participant's iPad reports a Macintosh user agent
- **THEN** each directions link is an Apple Maps search for that venue's query

#### Scenario: An Android phone gets Google Maps

- **WHEN** a participant whose user agent names Android opens the Venues view
- **THEN** each directions link is a Google Maps search for that venue's query

#### Scenario: The device cannot be identified

- **WHEN** the app cannot read a user agent
- **THEN** each directions link is a Google Maps search for that venue's query

#### Scenario: The query carries only authored text

- **WHEN** a crawl outside Illinois lists a venue named `Canal Cafe` at `7 River Rd` in `River Town`
- **THEN** the directions query is exactly `Canal Cafe, 7 River Rd, River Town`

#### Scenario: The seed keeps its Google searches

- **WHEN** a participant on a non-Apple device opens the Venues view for cory-trent
- **THEN** each directions link matches the Google Maps search it opened before this change, including `IL`, because the seed writes the state into each town

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

The Info view SHALL show the crawl's valid quick links in authored order. Each link SHALL show its label and optional hint, and open its destination in a new browser tab. A missing, invalid, or empty link list SHALL leave no link cards. The view SHALL omit a link without required text or with an unsafe URL while keeping valid siblings. The Schedule view SHALL start with the timeline and SHALL NOT show link cards. An album link SHALL use the same format and behavior as any other quick link. The Map view SHALL embed the configured Google map and link to its viewer URL. A missing or invalid map SHALL show an unavailable message without a frame or viewer link. The view SHALL NOT create a clickable link or frame from an unsafe URL. Whether the viewer link opens a native app depends on the participant's device.

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

- **WHEN** an organizer adds a group album to the crawl's link list
- **THEN** Info shows it in authored order with the same behavior as other links
- **THEN** Tasks shows no separate album button

#### Scenario: Map view shows the embedded map and viewer link

- **WHEN** the Map view receives valid Google map URLs
- **THEN** it embeds the configured map and links to the configured viewer URL

#### Scenario: A URL is unsafe at runtime

- **WHEN** a quick link or map URL uses an unsafe scheme or unsupported map origin
- **THEN** Info omits the unsafe quick link and keeps valid sibling links
- **THEN** the Map view shows no frame or viewer link for an unsafe map URL

#### Scenario: The map is missing at runtime

- **WHEN** the resolved crawl has no map object
- **THEN** the Map view shows an unavailable message without a frame or viewer link

### Requirement: Phone-first layout

The shell SHALL target a portrait phone used one-handed. It SHALL keep the header and bottom navigation fixed while content scrolls, respect safe-area insets, and make each tab and each checklist row a full-row or full-cell tap target. It SHALL follow the system light or dark setting through `prefers-color-scheme`, with no in-app toggle, and reduce motion when the device requests it.

#### Scenario: Dark mode follows the system

- **WHEN** the device is set to dark mode
- **THEN** the shell renders its dark palette without any in-app toggle

#### Scenario: Reduced motion is honored

- **WHEN** the device requests reduced motion
- **THEN** the shell disables its transitions and animations

#### Scenario: Five tabs fit a portrait phone

- **WHEN** the Info tab is visible at a 320 CSS pixel viewport width
- **THEN** every label is fully visible, every tab has a tap target of at least 44 by 44 CSS pixels, and the page has no horizontal overflow

### Requirement: Resolve the crawl before rendering views

The route SHALL give the shell its selected logical id. The shell SHALL obtain that crawl from the provider for each route selection. It SHALL pass the resolved crawl to the active view. A view SHALL NOT call the provider. While a result is pending, the shell SHALL show a loading state and SHALL NOT mount the views. For a found result, it SHALL render that crawl. For not-found, invalid, or error, it SHALL show a fallback and SHALL NOT mount views. A stale result SHALL NOT replace a newer route selection.

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

#### Scenario: The Info tab shows the seed content

- **WHEN** the resolved shell opens the Info tab for cory-trent
- **THEN** it shows the seed introduction and the Ventra and Metra links in authored order

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

- **WHEN** a participant opens Info for cory-trent
- **THEN** the view shows the seed introduction as three paragraphs
- **AND** "Don't forget" appears in bold without asterisks

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

- **WHEN** an introduction contains `Cory*and*Trent`
- **THEN** Info shows "and" in italic between "Cory" and "Trent", without asterisks

#### Scenario: Spaced asterisks stay literal

- **WHEN** an introduction contains `2 * 3 * 4 drinks`
- **THEN** Info shows `2 * 3 * 4 drinks` as written, without italic text

#### Scenario: A long asterisk run stays literal

- **WHEN** an introduction contains `****text****`
- **THEN** Info shows `****text****` as written, without bold or italic text

#### Scenario: An unmatched marker stays literal

- **WHEN** an introduction contains `**Don't forget` with no closing marker
- **THEN** Info shows `**Don't forget` as written, and the rest of the introduction renders

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
