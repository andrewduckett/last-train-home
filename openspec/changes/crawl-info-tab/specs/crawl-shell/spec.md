## ADDED Requirements

### Requirement: Crawl introduction

The Info view SHALL show a crawl's optional plain-text introduction when it is a string with non-whitespace text. It SHALL preserve Unicode text, including emoji, without interpreting markup. A missing, blank, or malformed introduction SHALL leave no introduction text and SHALL NOT prevent the crawl from loading.

#### Scenario: The seed introduction appears

- **WHEN** a participant opens Info for cory-trent
- **THEN** the view shows "Hello! and Welcome!"

#### Scenario: An introduction contains emoji

- **WHEN** an authored introduction contains emoji
- **THEN** Info shows those characters with the surrounding text

#### Scenario: The introduction is malformed at runtime

- **WHEN** the provider returns a non-string introduction with valid links
- **THEN** Info omits the introduction and keeps the links usable

## MODIFIED Requirements

### Requirement: Four-tab navigation

The shell SHALL always present Schedule, Map, Venues, and Tasks. It SHALL add Info after those tabs only when the crawl has an introduction string with non-whitespace text or a valid helpful link. The shell SHALL show one view at a time. It SHALL open on Schedule and mark the active tab.

#### Scenario: App opens on the Schedule tab

- **WHEN** a participant opens the app
- **THEN** the shell shows the Schedule view and marks the Schedule tab active

#### Scenario: Tapping a tab switches the view

- **WHEN** a participant taps a different tab
- **THEN** the shell shows that tab's view, marks it active, and scrolls the content to the top

#### Scenario: A crawl has Info content

- **WHEN** a crawl has an introduction string with non-whitespace text or at least one valid helpful link
- **THEN** the shell shows Info as its fifth tab

#### Scenario: A crawl has no Info content

- **WHEN** a crawl has no introduction string with non-whitespace text and no valid helpful link
- **THEN** the shell shows only Schedule, Map, Venues, and Tasks

#### Scenario: A blank or malformed introduction does not create Info

- **WHEN** a crawl has a whitespace-only or non-string introduction and no valid helpful links
- **THEN** the shell shows only Schedule, Map, Venues, and Tasks

### Requirement: Quick links and embedded map

The Info view SHALL show the crawl's valid helpful links in authored order. Each link SHALL show its label and optional hint, and open its destination in a new browser tab. A missing, invalid, or empty link list SHALL leave no link cards. The view SHALL omit a link without required text or with an unsafe URL while keeping valid siblings. The Schedule view SHALL start with the timeline and SHALL NOT show link cards. An album link SHALL use the same authored link format and behavior as any other helpful link. The Map view SHALL embed the configured Google map and link to its viewer URL. A missing or invalid map SHALL show an unavailable message without a frame or viewer link. The view SHALL NOT create a clickable link or frame from an unsafe URL. Whether the viewer link opens a native app depends on the participant's device.

#### Scenario: Quick link opens externally

- **WHEN** a participant taps an authored helpful link in Info
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

- **WHEN** a crawl has at least three helpful links on a portrait phone
- **THEN** each card keeps readable text and a full-card tap target without horizontal overflow

#### Scenario: Album link uses the common link format

- **WHEN** an organizer adds a group album to the crawl's link list
- **THEN** Info shows it in authored order with the same behavior as other links
- **THEN** Tasks shows no separate album button

#### Scenario: Map view shows the embedded map and viewer link

- **WHEN** the Map view receives valid Google map URLs
- **THEN** it embeds the configured map and links to the configured viewer URL

#### Scenario: A URL is unsafe at runtime

- **WHEN** a helpful link or map URL uses an unsafe scheme or unsupported map origin
- **THEN** Info omits the unsafe helpful link and keeps valid sibling links
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
