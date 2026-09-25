## RENAMED Requirements

- FROM: `### Requirement: Venue list with directions`
- TO: `### Requirement: Place list with directions`

## MODIFIED Requirements

### Requirement: Four-tab navigation

The shell SHALL always present Schedule, Map, Places, and Tasks. It SHALL add Info after those tabs only when the crawl has an introduction string with non-whitespace text or a valid quick link. The shell SHALL show one view at a time. It SHALL open on Schedule and mark the active tab. Each new crawl selection SHALL reset the active tab to Schedule.

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
- **THEN** the shell shows Info as its fifth tab

#### Scenario: A crawl has no Info content

- **WHEN** a crawl has no introduction string with non-whitespace text and no valid quick link
- **THEN** the shell shows only Schedule, Map, Places, and Tasks

#### Scenario: A blank or malformed introduction does not create Info

- **WHEN** a crawl has a whitespace-only or non-string introduction and no valid quick links
- **THEN** the shell shows only Schedule, Map, Places, and Tasks

#### Scenario: A new crawl omits Info while Info is active

- **WHEN** a participant opens another crawl without Info while viewing Info on the previous crawl
- **THEN** the shell selects Schedule for the new crawl and shows no Info tab

### Requirement: Place list with directions

The Places view SHALL list each stop in authored order, with its stop label and town. Under each stop, it SHALL list that stop's locations in authored order. Each location SHALL show its name and address. When a location has a label, the view SHALL show the label as a tag beside the name. The view SHALL NOT mark the locations at one stop as alternatives to each other. The app SHALL NOT supply any word for a kind of location, such as "station" or "bar".

Each location SHALL show a directions link that opens a map search. The search query SHALL be the location's name, its street address, and its stop's town, as authored, separated by a comma and a space. The app SHALL NOT add any other text to the query, such as a state or a label.

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

- **WHEN** a participant on a non-Apple device opens the Places view for cory-trent
- **THEN** each bar's directions link matches the Google Maps search it opened before this change

#### Scenario: The seed shows its stations

- **WHEN** a participant opens the Places view for cory-trent
- **THEN** the first card is `Meetup` with Palatine Metra Station, and each other stop lists its Metra station, labeled `Train`, before its bar, labeled `Bar`

### Requirement: Resolve the crawl before rendering views

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
