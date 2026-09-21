## ADDED Requirements

### Requirement: The shell renders the crawl from the provider

The shell SHALL obtain its crawl by calling the provider's `getCrawl(id)` with the
application's default crawl id, `cory-trent`. It SHALL resolve the crawl once and pass it
to the four views as a prop; a view SHALL NOT call the provider itself. While the promise
is pending, the shell SHALL show a loading state and SHALL NOT mount the views. When the
result is `found`, the shell SHALL render the four views from that crawl. When the result
is `not-found`, `invalid`, or `error`, the shell SHALL show a fallback message and SHALL
NOT mount the views.

#### Scenario: The default crawl resolves and the Schedule view shows its content

- **WHEN** the shell resolves `cory-trent` and renders, with the Schedule tab active by default
- **THEN** the header shows the seed crawl's `appTitle` and `line`, and the Schedule view lists the seed crawl's schedule entries in authored order

#### Scenario: The Venues tab shows the seed venues

- **WHEN** the shell has resolved `cory-trent` and the participant selects the Venues tab
- **THEN** the Venues view shows each seed venue's name, address, and directions link

#### Scenario: The Tasks tab shows the seed tasks

- **WHEN** the shell has resolved `cory-trent` and the participant selects the Tasks tab
- **THEN** the Tasks view lists each seed scavenger task with its points

#### Scenario: The Map tab shows the seed map URLs

- **WHEN** the shell has resolved `cory-trent` and the participant selects the Map tab
- **THEN** the Map view's embed `src` and viewer `href` match the seed crawl's map URLs

#### Scenario: Switching tabs does not re-resolve the crawl

- **WHEN** the participant switches between the four tabs after the crawl has resolved
- **THEN** the shell reads the crawl it already resolved and calls `getCrawl` only once

#### Scenario: A non-found result shows a fallback

- **WHEN** `getCrawl` resolves to `not-found`, `invalid`, or `error`
- **THEN** the shell shows a fallback message and does not mount the four views

#### Scenario: A pending result shows a loading state

- **WHEN** the crawl promise has not yet resolved
- **THEN** the shell shows a loading state and does not mount the four views
