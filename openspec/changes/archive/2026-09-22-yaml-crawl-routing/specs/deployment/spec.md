## ADDED Requirements

### Requirement: Revalidate crawl records after deployment

The host SHALL require caches to revalidate YAML crawl records before reuse. The policy SHALL apply to stable URLs under the crawl asset path.

#### Scenario: An organizer redeploys an updated crawl

- **WHEN** a participant requests the same YAML crawl URL after a deployment
- **THEN** browser and edge caches revalidate the record before serving it

#### Scenario: Built assets keep their existing cache behavior

- **WHEN** the host serves scripts, styles, fonts, or images outside the crawl asset path
- **THEN** the YAML revalidation policy does not change their cache behavior
