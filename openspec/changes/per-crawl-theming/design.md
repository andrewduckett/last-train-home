## Context

See `proposal.md` for the need. The provider validates `color` as an optional string and carries it through unchanged. `Shell.svelte` receives the resolved crawl. Today `src/app.css` defines light and dark values, while several views still use fixed orange and dark text values. A `data-theme` override also duplicates dark tokens. The CSP permits same-origin styles and inline style attributes.

## Goals / Non-Goals

**Goals:**

- Keep palette selection inside the theme layer, after the provider resolves a crawl.
- Make published colors auditable from one palette source and its generated CSS.
- Keep the existing content layout and station-board character.

**Non-Goals:**

- Letting authors enter arbitrary color values.
- Adding a theme toggle or saving a color preference.
- Coloring individual stops, tasks, or other definition entries.

## Decisions

### Resolve a small set of exact palette names

The theme resolver accepts a `color` string and returns `amber`, `teal`, or `neutral`. It maps missing and unknown names to `neutral`. `cory-trent.yaml` declares `color: amber`, so the first crawl retains its identity. The provider and build's identity validation continue to check type only. Rejecting unknown names there would violate the existing boundary and make a typo block the whole crawl.

The shell places a palette attribute on its outer element after a found result arrives. Descendant views inherit CSS variables from that element. A route change replaces the shell's selected palette. The neutral palette supplies root tokens for loading and error states. Applying a global attribute to `html` would make overlapping or delayed route loads easier to theme incorrectly.

All palettes share the same light and dark background, content surfaces, and station-board surfaces. Named palettes change accent tokens only. The neutral page background outside the 520px shell therefore matches the shell background. When a route changes before an earlier fetch finishes, the shell ignores the late result before creating a checklist controller. This prevents obsolete storage reads as well as stale accents.

### Generate all UI color tokens from one data file

Keep the neutral palette, both named accents, and shared semantic colors in one palette source under `src/lib/theme/`. A Node script emits a deterministic CSS file beside it. `src/app.css` imports that file and contains layout rules but no authored color values. Component styles use CSS variables for every color, including the board's active labels, pills, tinted map panel, filled buttons, and checklist marks.

Generate selectors for the neutral palette root, named shell palettes, and their dark variants inside one `prefers-color-scheme: dark` query. Remove the `data-theme` overrides. Keep the board surface dark in both schemes, while its text and accent tokens can vary by palette. Keep checklist success green as a shared semantic token. A hand-edited CSS token list would repeat values and allow source and output to drift.

Use separate tokens for accent text on a surface, text on an accent fill, and accent text on the board. One color cannot safely serve every background. Name each contrast pair in the palette source, including foreground and muted text against content surfaces. Decorative colors can remain outside the pair registry only when no text uses them.

### Verify the emitted stylesheet, not only palette data

Generate the CSS before `vite build`. A test runs the generator in check mode, reads the emitted CSS, and verifies each expected selector and token value. The same test computes WCAG contrast from the emitted values for every declared text/background pair in light and dark mode. Ordinary text uses 4.5:1; any deliberately large text pair must be named and use 3:1. This catches a generator or stylesheet mapping error that source-only tests would miss.

Use a focused shell test with amber, teal, and unknown records to prove palette selection and route changes. Existing view tests protect rendering and navigation. The static build remains same-origin and needs no CSP change.

## Risks / Trade-offs

- **A fixed color remains in a component** → Search authored styles and markup for color literals, then replace them with named tokens.
- **A tinted background hides a contrast failure** → Treat text on tinted panels as a declared pair and test its effective background.
- **Generated CSS is stale in a commit** → Check the generated output during tests and regenerate it before the production build.
- **A delayed crawl result changes the wrong shell's accent** → Scope the palette attribute to the resolved shell and keep route-keyed mounting.

## Migration Plan

Write failing resolver, shell, generation, and contrast tests first. Add the palette source and generator, then move global and component colors to emitted tokens. Add `color: amber` to the seed YAML. Run tests, type checks, crawl validation, and the static build. Deploy the CSS and YAML in one static release. Roll back by redeploying the previous release; checklist state does not change.
