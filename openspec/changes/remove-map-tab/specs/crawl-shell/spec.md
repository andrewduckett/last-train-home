## RENAMED Requirements

- FROM: `### Requirement: Four-tab navigation`
- TO: `### Requirement: Tab navigation`

## MODIFIED Requirements

### Requirement: Tab navigation

The shell SHALL always present Schedule, Places, and Tasks, in that order. It SHALL NOT present a Map tab. It SHALL add Info after those tabs only when the crawl has an introduction string with non-whitespace text or a valid quick link. The shell SHALL show one view at a time. It SHALL open on Schedule and mark the active tab. Each new crawl selection SHALL reset the active tab to Schedule.

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
- **THEN** the tab bar shows a Places tab with a neutral pin icon, and no Venues tab

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

## REMOVED Requirements

### Requirement: Quick links and embedded map

**Reason**: The app no longer embeds a map. The quick-link rules move unchanged to the new "Quick links" requirement.

**Migration**: Authors link a route map from `links`, and Info shows it as a quick link.

### Requirement: Phone-first layout

**Reason**: Its "Five tabs fit a portrait phone" scenario no longer applies, because the shell now shows at most four tabs. OpenSpec cannot drop a scenario from a modified requirement, so this change replaces the requirement.

**Migration**: The added "Phone-first shell layout" requirement keeps the same rules and checks four tabs at 320 CSS pixels.

### Requirement: Resolve the crawl before rendering views

**Reason**: Its "The Map tab shows the seed map URLs" scenario no longer applies. OpenSpec cannot drop a scenario from a modified requirement, so this change replaces the requirement.

**Migration**: The added "Resolve the crawl before a view renders" requirement keeps the same rules and checks the seed's route map as an Info link.

## ADDED Requirements

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

- **WHEN** an organizer adds a group album to the crawl's link list
- **THEN** Info shows it in authored order with the same behavior as other links
- **THEN** Tasks shows no separate album button

#### Scenario: A URL is unsafe at runtime

- **WHEN** a quick link URL uses an unsafe scheme
- **THEN** Info omits the unsafe quick link and keeps valid sibling links


#### Scenario: A route map is a quick link

- **WHEN** an organizer adds a route map URL to the crawl's link list
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

- **WHEN** the shell resolves cory-trent with the Schedule tab active
- **THEN** the header shows the seed appTitle and line, and Schedule lists entries in authored order

#### Scenario: The Venues tab shows the seed venues

- **WHEN** the resolved shell opens the Places tab
- **THEN** the view shows each seed location's name, address, label, and directions link

#### Scenario: The Tasks tab shows the seed tasks

- **WHEN** the resolved shell opens the Tasks tab
- **THEN** the view lists each seed scavenger task with its points

#### Scenario: The Info tab shows the seed route map link

- **WHEN** the resolved shell opens the Info tab for cory-trent
- **THEN** it shows a Route map link whose destination is the seed's My Maps viewer URL

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
