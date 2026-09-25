## MODIFIED Requirements

### Requirement: Venue list with directions

The Venues view SHALL list each stop with its venue names and addresses. Each venue SHALL show a directions link that opens a map search in a new browser tab. The search query SHALL be the venue's name, street address, and town, as authored, separated by a comma and a space. The app SHALL NOT add any other text to the query, such as a state.

On an Apple device, the link SHALL open an Apple Maps search at `https://maps.apple.com/` with the query in its `q` parameter. An Apple device is one whose user agent names an iPhone, iPad, iPod, or Macintosh. On any other device, and when the app cannot read the user agent, the link SHALL open a Google Maps search at `https://www.google.com/maps/search/?api=1` with the query in its `query` parameter.

#### Scenario: Directions link opens a map search

- **WHEN** a participant taps a venue's directions link
- **THEN** the browser opens the venue's map search in a new tab

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
