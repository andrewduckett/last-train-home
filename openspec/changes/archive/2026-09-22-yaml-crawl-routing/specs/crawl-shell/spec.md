## MODIFIED Requirements

### Requirement: Resolve the crawl before rendering views

The route SHALL give the shell its selected logical id. The shell SHALL obtain that crawl from the provider for each route selection. It SHALL pass the resolved crawl to the four views. A view SHALL NOT call the provider. While a result is pending, the shell SHALL show a loading state and SHALL NOT mount the views. For a found result, it SHALL render that crawl. For not-found, invalid, or error, it SHALL show a fallback and SHALL NOT mount views. A stale result SHALL NOT replace a newer route selection.

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
