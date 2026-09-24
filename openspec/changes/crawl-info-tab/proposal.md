## Why

Helpful links currently appear before the timetable, and organizers cannot introduce a crawl. Participants need the schedule first, with crawl context and links nearby when needed.

## What Changes

- Add an Info tab when a crawl has an introduction or at least one valid helpful link.
- Let organizers write a short, plain-text introduction that supports emoji.
- Move authored links from Schedule to Info. Keep cory-trent's Ventra and Metra links.
- **BREAKING**: Replace the special `albumUrl` field with an ordinary authored link. Remove its Tasks button and the seed placeholder until a real URL exists.
- Set cory-trent's introduction to exactly "Hello! and Welcome!".

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `crawl-shell`: Show conditional Info navigation, introduction, and authored links while keeping Schedule focused on the timeline.
- `crawl-authoring`: Validate the optional introduction and support album links through the existing link list.

## Impact

This change affects the crawl YAML, definition type, build validation, shell navigation, Schedule and Tasks views, and their tests. The provider still carries definition data unchanged.
