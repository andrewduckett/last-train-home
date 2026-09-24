# 0007. Generate theme tokens from one palette source

- Status: proposed
- Date: 2026-09-23
- Supersedes: none
- Superseded by: none

## Context

Last Train Home displays timed outings called crawls. Each crawl can name an accent, while every screen keeps a shared station-board design. The site is static, follows the device's light or dark setting, and must keep text readable outdoors.

Color values currently appear in global CSS and individual components. A new accent would multiply those copies. A designer could fix one value while leaving an unreadable button or dark-mode label elsewhere. A future crawl author also needs a safe fallback when a color name is unknown.

## Decision

We keep every authored UI color in one palette source. A build script emits CSS variables for the neutral, amber, and teal palettes in light and dark modes. The shell selects a named palette after its crawl resolves. Missing and unknown names select the neutral palette. The crawl provider only carries the name; it never interprets the palette.

We declare text and background pairs alongside the values. Tests read the emitted CSS and check those pairs against WCAG AA. This makes the shipped output, rather than an unused source table, the object of verification.

We considered hand-maintaining CSS for each palette. That would be simple at first, but values and contrast checks could drift apart. We also considered computing CSS colors at runtime. That would add client logic for a small fixed set of palettes and make the published colors harder to audit.

## Consequences

- Adding a named palette requires one source edit, generation, and contrast verification.
- Component styles use semantic tokens instead of local color literals.
- The generated CSS is committed for review but never edited by hand.
- The build must regenerate CSS, and tests must detect stale committed output.
- Unknown names keep a crawl usable with a neutral accent.
