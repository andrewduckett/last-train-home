## Purpose

Crawl theming gives each outing a readable accent while keeping the shared station-board interface consistent across light and dark system settings.

## ADDED Requirements

### Requirement: Resolve an authored color to a crawl palette

The theme layer SHALL recognize the names `amber` and `teal`. It SHALL use the neutral station-board palette when `color` is absent or unknown. An unknown name SHALL NOT prevent any crawl view from rendering.

#### Scenario: An authored palette is available

- **WHEN** a crawl has `color: amber` or `color: teal`
- **THEN** its shell and views use that named accent palette

#### Scenario: A color is missing or unknown

- **WHEN** a crawl has no `color` or an unrecognized color name
- **THEN** its shell and views use the neutral accent palette
- **THEN** the crawl remains usable

#### Scenario: The selected crawl changes

- **WHEN** navigation replaces a resolved crawl with one using another palette
- **THEN** the new crawl uses its own palette without retaining the previous accent

### Requirement: Follow the system color scheme

Each palette SHALL provide light and dark tokens. The displayed tokens SHALL follow `prefers-color-scheme` without an in-app theme control.

#### Scenario: The system requests dark colors

- **WHEN** the device changes from light to dark mode
- **THEN** the selected crawl uses its dark tokens while retaining its accent name

### Requirement: Keep authored accents readable

Every published palette SHALL meet WCAG AA contrast for text on its declared backgrounds. This includes foreground and muted text on content surfaces, station-board text, accent text, and text on filled accent controls. Tests SHALL check these pairs in the generated CSS used by the build.

#### Scenario: A palette is published

- **WHEN** the build includes a light or dark palette
- **THEN** every declared text and background pair meets the applicable WCAG AA contrast threshold

#### Scenario: Generated tokens drift from their source

- **WHEN** the checked-in generated CSS differs from the palette source
- **THEN** verification fails before the site is published

### Requirement: Preserve the first crawl's accent

The `cory-trent` record SHALL select `amber`. Shared station-board surfaces and semantic checklist success styling SHALL remain consistent across crawls.

#### Scenario: The default crawl opens

- **WHEN** a crawler opens `/` or `/cory-trent`
- **THEN** the crawl displays the amber accent in the current system color scheme
