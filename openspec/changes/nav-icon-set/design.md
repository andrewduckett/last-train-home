## Context

`Shell.svelte` holds the tab list as `{ id, label, icon }`, where `icon` is an emoji string. The nav renders it in a `.nav-icon` span and dims inactive tabs to 55% opacity. The label sets its own color: `--board-muted` when inactive and `--board-accent` when active. The header renders 🚆 in a `.header-icon` span.

Three constraints shape the approach:

- **CSP (ADR 0002).** The policy allows `script-src 'self'` and `img-src 'self' data:`. Inline SVG markup is not a script, so it needs no policy change.
- **Theme tokens (ADR 0007).** Color values live only in the palette source. The palette test already holds `board-muted` and `board-accent` to at least 4.5:1 against `board` in every palette. Icons need 3:1 as non-text graphics, so those tokens already pass.
- **The skill's output.** `icon-set-generator` writes one `.svg` file per icon, a `style-spec.json`, and a `preview.html`. Every SVG uses `currentColor` and one shared set of root stroke attributes.

## Goals / Non-Goals

**Goals:**

- Keep the skill's `.svg` files as the only source for each icon's drawing.
- Let each icon inherit its color from CSS, so theme tokens stay the only source of color.
- Fail a test when an icon breaks the set's style rules.

**Non-Goals:**

- A general icon system for every view. The component serves the shell's five icons. Later stories can add icons to the same set.
- Runtime loading of icons chosen by crawl authors.

## Decisions

### 1. Generate the set with the Bold preset, then commit the SVGs and the style spec

The implementer runs `icon-set-generator` with the Bold preset: a 24-unit grid, a 2.5-unit stroke, round caps and joins, a 2-unit corner radius, and 2 units of padding. The set holds `clock`, `map-pin`, `checklist`, `info`, and `train`. The five `.svg` files and `style-spec.json` go in `src/lib/icons/`.

The skill's `preview.html` goes in `.workspace/icons/` for review and stays out of the repo. The page is a review aid, and the build must not ship it.

Bold fits the phone-first target. The shell draws icons at about 20 to 22 CSS pixels, outdoors, often in sunlight. A 1.5-unit stroke at that size reads thin.

- *Alternative: an icon library such as Lucide.* A library adds a dependency for five icons, and its look is common to many apps. The user asked for a generated set.

### 2. Inline each SVG through one `Icon.svelte` component

`Icon.svelte` loads every file in `src/lib/icons/` with `import.meta.glob('./icons/*.svg', { query: '?raw', import: 'default', eager: true })`. It takes a `name` prop, typed as a union of the five icon names. It renders the matching SVG string with `{@html}` inside a `<span aria-hidden="true" data-icon={name}>`. Tests find an icon by its `data-icon` value. A `size` prop sets the span's width and height. A scoped `:global(svg)` rule makes the SVG fill the span.

The build places the SVG strings in the JavaScript bundle. The browser draws them as inline DOM, so they need no request and inherit `color` from their parent.

- *Alternative: `<img src="...svg">`.* An image cannot inherit `currentColor`, so the active tab could not take the accent.
- *Alternative: an SVG sprite with `<use href>`.* An external sprite costs a network request. An inline sprite adds a hidden block to the page for five small icons.
- *Alternative: one hand-written Svelte component per icon.* That copies each drawing out of the skill's files. The copies could drift from the files, and a regenerated icon would need a hand edit.

`{@html}` renders raw markup, so it must never receive crawl data. The `name` prop's union type allows only committed file names. The glob reads only files from the repo at build time. No crawl field reaches the component.

### 3. Color the whole tab button, not each part

`.nav-btn` sets `color: var(--board-muted)`. `.nav-btn-active` sets `color: var(--board-accent)`. The icon and the label both inherit that color, so they always match. The `opacity` style on `.nav-icon` goes away. `.header-icon` sets `color: var(--board-ink)`.

- *Alternative: keep opacity dimming.* The user chose the accent treatment. Dimming by opacity would also leave the muted icon's contrast untested, because the palette test checks tokens, not opacity.

### 4. Enforce the style rules with a unit test

`src/lib/icons/icons.test.ts` reads `style-spec.json` and parses each `.svg` file with the jsdom `DOMParser`. For every icon, it checks that:

- the file list matches the spec's `icons` list, and each name is lowercase kebab-case;
- the root `viewBox`, `stroke-width`, `stroke-linecap`, and `stroke-linejoin` match the spec;
- every `fill` and `stroke` value is `none` or `currentColor`;
- no element carries an `id`, a `class`, a `style`, or a `transform`;
- no element is a `<script>` or has an `on*` attribute;
- every number has at most two decimal places.

The test turns the skill's quality checklist into a gate that also covers later icons.

## Risks / Trade-offs

- [Raw markup reaches the DOM through `{@html}`] → Only repo files feed it, the `name` prop is a closed union, and the test rejects scripts and event attributes.
- [A 2.5-unit stroke can clog detail at 20 pixels, such as the checklist's lines or the train's windows] → The implementer reviews `preview.html` at 1× and 2× and keeps each drawing to a few shapes, per the skill's rules.
- [Tests that match the 📍 text break] → `Shell.test.ts` changes to find the pin icon by name. The implementer searches the tests for each emoji before the swap.
- [The bundle grows by five small SVG strings] → The five files total under 2 KB before compression.

## Migration Plan

The change ships as one static deploy. Rollback is a revert of the change's commits. The change touches no data, storage key, or URL.
