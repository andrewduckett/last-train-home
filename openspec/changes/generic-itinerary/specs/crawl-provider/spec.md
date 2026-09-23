## MODIFIED Requirements

### Requirement: Preserve the planned seed crawl

The YAML seed SHALL preserve the planned event's visible schedule wording, times, and entry order when its fields move to the generic itinerary schema. It SHALL preserve venue and task content, link labels and destinations, map destinations, and their authored order. The seed SHALL use the current definition fields rather than retaining obsolete field names.

#### Scenario: The seed record matches the existing event

- **WHEN** the migrated cory-trent YAML record is compared with the earlier seed event
- **THEN** its rendered schedule wording, times, and order match the earlier event
- **THEN** its venue, task, link, and map content and destinations match the earlier event
