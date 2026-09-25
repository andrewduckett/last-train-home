## MODIFIED Requirements

### Requirement: Crawl introduction

The Info view SHALL show a crawl's optional introduction when it is a string with non-whitespace text. It SHALL preserve Unicode text, including emoji. A missing, blank, or malformed introduction SHALL leave no introduction text and SHALL NOT prevent the crawl from loading.

The Info view SHALL render a small set of authored formatting:

- A blank line SHALL start a new paragraph. A line that holds only whitespace SHALL count as blank.
- A single line break inside a paragraph SHALL show as a line break.
- Text between `**` markers SHALL show as bold. Text between `*` markers SHALL show as italic. Text between `***` markers SHALL show as bold and italic.
- A marker SHALL count only when it touches its text. An opening marker SHALL have a non-whitespace character right after it. A closing marker SHALL have a non-whitespace character right before it.
- Markers SHALL pair only within one line.
- Any asterisk left without a partner SHALL stay as literal text.

The Info view SHALL show all other markup as literal text, including HTML tags. Unusual or unbalanced formatting SHALL NOT prevent the introduction or the crawl from rendering.

#### Scenario: The seed introduction appears

- **WHEN** a participant opens Info for cory-trent
- **THEN** the view shows the seed introduction as three paragraphs
- **AND** "Don't forget" appears in bold without asterisks

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
