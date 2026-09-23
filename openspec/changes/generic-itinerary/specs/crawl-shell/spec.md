## MODIFIED Requirements

### Requirement: Schedule timeline

The Schedule view SHALL show valid timed `stop`, `move`, and `note` entries in authored order. Each entry SHALL show its time and title. It SHALL show an authored tag when present and a kind-based tag otherwise. A move SHALL show its authored mode without limiting that text to known transit types. Each entry SHALL show its optional note; a move SHALL show its mode before that note. The view SHALL distinguish moves, stops, and notes visually. An invalid entry SHALL be omitted without hiding valid entries or failing the crawl page.

#### Scenario: Timeline renders in order

- **WHEN** the Schedule view receives valid stop, move, and note entries
- **THEN** it lists them in authored order with their times, titles, tags, and available details

#### Scenario: A walking move uses author text

- **WHEN** a move has `mode: 15 min walk to the next stop`
- **THEN** the timeline shows that text without replacing it with a train label

#### Scenario: One entry is malformed at runtime

- **WHEN** a schedule contains an entry without a valid kind or required text
- **THEN** the timeline omits that entry and continues to show valid entries

#### Scenario: The schedule container is missing at runtime

- **WHEN** the resolved crawl has no schedule list
- **THEN** the Schedule view shows an unavailable message and the other crawl tabs remain usable

### Requirement: Quick links and embedded map

The Schedule view SHALL show the crawl's valid quick links in authored order. Each link SHALL show its label and optional hint, and open its configured destination in a new browser tab. A missing, invalid, or empty link list SHALL leave no quick-link cards. A link without required text SHALL be omitted while valid siblings remain. The Map view SHALL embed the crawl's configured Google map and link to its configured Google map viewer URL. A missing or invalid map SHALL show an unavailable message without a frame or viewer link. The view SHALL not create a clickable link or frame from an unsafe URL. Whether the viewer link opens a native app depends on the participant's device.

#### Scenario: Quick link opens externally

- **WHEN** a participant taps an authored quick link
- **THEN** the browser opens that link's configured destination in a new tab

#### Scenario: A crawl has no quick links

- **WHEN** the crawl's quick-link list is empty
- **THEN** the Schedule view shows no quick-link cards

#### Scenario: The link list is malformed at runtime

- **WHEN** the resolved crawl has a non-array link list
- **THEN** the Schedule view shows no quick-link cards and keeps the timeline usable

#### Scenario: One link lacks a label

- **WHEN** one authored link lacks a label beside a valid link
- **THEN** the Schedule view omits the malformed link and shows the valid link

#### Scenario: Several links fit a phone screen

- **WHEN** a crawl has at least three quick links on a portrait phone
- **THEN** each card keeps readable text and a full-card tap target without horizontal overflow

#### Scenario: Map view shows the embedded map and viewer link

- **WHEN** the Map view receives valid Google map URLs
- **THEN** it embeds the configured map and links to the configured viewer URL

#### Scenario: A URL is unsafe at runtime

- **WHEN** a quick link or map URL uses an unsafe scheme or unsupported map origin
- **THEN** the view does not expose that URL as a clickable link or frame

#### Scenario: The map is missing at runtime

- **WHEN** the resolved crawl has no map object
- **THEN** the Map view shows an unavailable message without a frame or viewer link
