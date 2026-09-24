## ADDED Requirements

### Requirement: Validate optional crawl introduction

The build SHALL accept an omitted introduction. When present, `definition.intro` SHALL be a non-empty string after trimming whitespace. The build SHALL accept Unicode characters, including emoji, in the introduction. Invalid introductions SHALL fail validation with the record and field identified.

#### Scenario: A crawl omits the introduction

- **WHEN** an otherwise valid crawl omits `definition.intro`
- **THEN** build validation accepts the crawl

#### Scenario: An introduction contains emoji

- **WHEN** an otherwise valid crawl has an introduction with emoji
- **THEN** build validation accepts the crawl

#### Scenario: An introduction has the wrong type

- **WHEN** an authored introduction is a number, list, or object
- **THEN** build validation fails and identifies `definition.intro`

#### Scenario: An introduction is blank

- **WHEN** an authored introduction contains only whitespace
- **THEN** build validation fails and identifies `definition.intro`

### Requirement: Author album links through the common link list

The build SHALL accept a crawl without an album link. Organizers SHALL add a group album through `definition.links` when they have a working URL. The build SHALL apply the existing link validation rules to that album link. The build SHALL reject the obsolete `definition.albumUrl` field so an author does not publish an invisible album destination.

#### Scenario: The seed has no album destination

- **WHEN** cory-trent has Ventra and Metra links but no album URL
- **THEN** build validation accepts its link list

#### Scenario: An organizer adds an album link

- **WHEN** an organizer adds an album label and valid HTTP or HTTPS URL to `definition.links`
- **THEN** build validation accepts that link under the existing link rules

#### Scenario: An album link uses an unsafe URL

- **WHEN** an album link uses a URL scheme other than HTTP or HTTPS
- **THEN** build validation fails and identifies that link's URL field

#### Scenario: An old album field remains

- **WHEN** an authored crawl contains `definition.albumUrl`
- **THEN** build validation fails and identifies `definition.albumUrl`
