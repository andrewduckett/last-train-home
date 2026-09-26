## MODIFIED Requirements

### Requirement: Expose the in-repo crawl by its id

The in-repo provider SHALL expose each authored YAML crawl by its requested logical id. It SHALL return not-found when no authored record matches the logical id.

#### Scenario: The seed crawl resolves by its id

- **WHEN** a caller calls getCrawl with the configured default logical id
- **THEN** the promise resolves to a found result whose crawl id is that logical id

#### Scenario: Another authored crawl resolves by its id

- **WHEN** a caller calls getCrawl with the logical id of any authored record
- **THEN** the promise resolves to a found result whose crawl id is that logical id and whose content is that record's content

#### Scenario: Another id is not found

- **WHEN** a caller calls getCrawl with an unknown logical id
- **THEN** the promise resolves to not-found

## REMOVED Requirements

### Requirement: Preserve the planned seed crawl

**Reason**: This requirement guarded a one-time migration from the earlier event page to the YAML record. That migration has shipped. Keeping the check pins the live crawl's content, so every content edit breaks verification.

**Migration**: None for authors or crawlers. Build validation still checks each authored record. A contract test checks that each one resolves through the provider, as ADR 0008 records. Behavior checks use generated crawls.
