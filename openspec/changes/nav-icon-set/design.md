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

The skill's `preview.html` goes in `.workspace/icons/` for review and stays out of the repo and the build.

Bold fits the phone-first target. The shell draws icons at about 20 to 22 CSS pixels, outdoors, often in sunlight. A 1.5-unit stroke at that size reads thin.

- *Alternative: an icon library such as Lucide.* A library adds a dependency for five icons, and its look is common to many apps. The user asked for a generated set.

### 2. Inline each SVG through one `Icon.svelte` component

`Icon.svelte` loads every file in `src/lib/icons/` with `import.meta.glob('./icons/*.svg', { query: '?raw', import: 'default', eager: true })`. It takes a `name` prop, typed as a union of the five icon names. It renders the matching SVG string with `{@html}` inside a `<span aria-hidden="true" data-icon={name}>`. Tests find an icon by its `data-icon` value. A `size` prop sets the span's width and height. A scoped `:global(svg)` rule makes the SVG fill the span.

The build places the SVG strings in the JavaScript bundle. The browser draws them as inline DOM, so they need no request and inherit `color` from their parent.

- *Alternative: `<img src="...svg">`.* An image cannot inherit `currentColor`, so the active tab could not take the accent.
- *Alternative: an SVG sprite with `<use href>`.* An external sprite costs a network request. An inline sprite adds a hidden block to the page for five small icons.
- *Alternative: one hand-written Svelte component per icon.* That copies each drawing out of the skill's files. The copies could drift from the files, and a regenerated icon would need a hand edit.

`{@html}` renders raw markup, so it must never receive crawl data. The glob reads only files from the repo at build time. No crawl field reaches the component. The `name` prop's union type allows only committed file names at compile time. At run time, the component fails closed: an unknown name renders an empty span. The test in decision 4 limits what markup the files may hold.

### 3. Color the whole tab button, not each part

`.nav-btn` sets `color: var(--board-muted)`. `.nav-btn-active` sets `color: var(--board-accent)`. The icon and the label both inherit that color, so they always match. The `opacity` style on `.nav-icon` goes away. `.header-icon` sets `color: var(--board-ink)`.

- *Alternative: keep opacity dimming.* The user chose the accent treatment. Dimming by opacity would also leave the muted icon's contrast untested, because the palette test checks tokens, not opacity.

### 4. Enforce the style and safety rules with a unit test

`src/lib/icons/icons.test.ts` parses each `.svg` file with the jsdom `DOMParser`. The test holds the Bold preset values itself, so a drifting `style-spec.json` cannot loosen the gate. For every icon, it checks that:

- the file parses with no parser error;
- the file list matches the spec's `icons` list, and each name is lowercase kebab-case;
- `style-spec.json` names the Bold preset values below;
- the root `viewBox` is `0 0 24 24`, `stroke-width` is `2.5`, and `stroke-linecap` and `stroke-linejoin` are `round`;
- no child sets `stroke-width`, `stroke-linecap`, or `stroke-linejoin`;
- every element sits in the SVG namespace and is one of `svg`, `path`, `circle`, `ellipse`, `rect`, `line`, `polyline`, or `polygon`;
- the root allows only `xmlns`, `width`, `height`, `viewBox`, `fill`, `stroke`, `stroke-width`, `stroke-linecap`, and `stroke-linejoin`;
- a child allows only `fill`, `stroke`, `d`, `cx`, `cy`, `r`, `rx`, `ry`, `x`, `y`, `width`, `height`, `x1`, `y1`, `x2`, `y2`, and `points`, so no child declares a namespace;
- every `fill` and `stroke` value is `none` or `currentColor`;
- every number has at most two decimal places.

The allowlists reject scripts, event attributes, `style`, `transform`, `id`, `class`, and every element that can load a URL, such as `image`, `use`, or `foreignObject`. A later icon that needs another element or attribute must widen the list in a reviewed change.

## Verification

jsdom does not resolve the color cascade from scoped styles. So the plan checks color in two parts: the DOM shows which element inherits, and the built CSS shows which token each element gets.

| Spec scenario | Check |
|---|---|
| Each tab shows its icon | A Shell test finds `[data-icon]` in each tab with the expected name. The tab bar's text holds no emoji. |
| The header shows a train | A Shell test finds `[data-icon="train"]` in the header, and the header text holds no emoji. The build test checks that the header icon rule sets `color: var(--board-ink)`. |
| The active icon takes the accent | A Shell test checks that no icon span has an inline `style` other than its size, and each SVG uses `currentColor`. A build test reads the built CSS. It checks that the nav button rule sets `color: var(--board-muted)`, and the active rule sets `color: var(--board-accent)`. It also checks that no nav rule sets `opacity` below 1, so inactive icons stay at full opacity. The existing palette test checks the amber token. |
| A crawl without a valid color uses the neutral accent | The existing theme test selects the neutral palette for a missing or unknown color. The build test above ties the icon to that palette's token. |
| Screen readers hear only the tab labels | A Shell test finds each tab by `getByRole('button', { name })` with its exact label. Each icon span has `aria-hidden="true"`. |
| Icons load with the app | A build test checks that `build/` holds no copy of the five icon files and that an icon's path data appears in the JavaScript bundle. |
| The Places tab replaces Venues | The Places test checks for `[data-icon="map-pin"]` instead of the 📍 text. |

## Risks / Trade-offs

- [Raw markup reaches the DOM through `{@html}`] → Only repo files feed it, the `name` prop is a closed union, and the test rejects scripts and event attributes.
- [A 2.5-unit stroke can clog detail at 20 pixels, such as the checklist's lines or the train's windows] → The implementer reviews `preview.html` at 1× and 2× and keeps each drawing to a few shapes, per the skill's rules.
- [Tests that match the 📍 text break] → `Shell.test.ts` changes to find the pin icon by its `data-icon` value. The implementer searches the tests for each emoji before the swap.
- [The bundle grows by five small SVG strings] → The five files total under 2 KB before compression.

## Migration Plan

The change ships as one static deploy. Rollback is a revert of the change's commits. The change touches no data, storage key, or URL.
