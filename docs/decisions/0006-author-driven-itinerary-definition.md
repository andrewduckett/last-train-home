# 0006. Author-driven itinerary definition

- Status: proposed
- Date: 2026-09-23
- Supersedes: none
- Superseded by: none

## Context

Last Train Home renders timed outings called crawls. An organizer writes one YAML record per crawl. The record contains a schedule, links, a map, venues, and scavenger tasks. The first crawl uses trains, but later crawls may use walking or other ways to move.

The current schedule calls entries arrivals, departures, warnings, or stops. That vocabulary fits the first crawl but makes travel mode part of the app's data contract. The screen also assumes every crawl needs two train links. A future organizer would have to supply irrelevant fields or change the screen.

The app retrieves records through a provider that checks identity and leaves the definition unchanged. The build checks authored definitions before publication. The screen must still survive an unexpected malformed definition at runtime.

## Decision

We give every timed schedule entry one of three meanings: `stop`, `move`, or `note`. A move carries author-written `mode` text. The app does not define a list of transport modes. Each crawl also supplies an ordered `links` list and its own Google map URLs. An empty link list is valid.

We keep these fields inside the record's existing `definition` envelope. The provider continues to carry the definition through unchanged. The build rejects malformed authored fields, while the schedule layer omits an invalid entry encountered at runtime.

We considered retaining departure and arrival kinds with extra kinds for walking. That would preserve the first record's shape, but every new travel style would expand app vocabulary. We also considered converting old records inside the provider. That would give the provider rendering knowledge and make later data sources repeat the conversion.

## Consequences

- Authors describe the outing in its own words. A walking move and a train move use the same shape.
- The first record needs a one-time migration. Old schedule kinds are not part of the new authoring contract.
- Screens can render each crawl's links and map without train-specific fields.
- Build validation and runtime resolution have different jobs. A bad authored file blocks publication; an unexpected bad entry does not break an open page.
- A future source can provide the same definition without changing the provider interface.
