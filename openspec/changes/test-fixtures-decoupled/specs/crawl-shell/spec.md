## MODIFIED Requirements

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
