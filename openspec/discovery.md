# Discovery: Last Train Home — a renderer for many timed crawls

> Status: complete
> Created: 2026-09-20 · Last revised: 2026-09-21

> Release plan produced by the discovery skill. Resume or revise by re-running the skill.
> To build: run `/opsx:propose` and ask it to use the next unchecked story below.
> One story = one OpenSpec change (proposal ≈ 200 words). Create one at a time.

## Sources

- 2026-09-20 — `openspec/prd.md` (Last Train Home — a renderer for many timed crawls).
  Turn a working, single-event coordinator into a static renderer for many hand-edited
  YAML "crawls." A crawl is a themed, multi-stop, timed outing: schedule, venues,
  scavenger tasks, quick links, embedded map. Transit is optional — walking is just a
  mode. Durable constraints: static-first SvelteKit `adapter-static`, strict CSP
  (`script-src 'self'`, no `'unsafe-inline'`), no future-DB traps (provider + state-store
  interfaces, logical ids, definition vs state), theme tokens one source of truth,
  phone-first.
- Repo state at discovery time: a **working** app — React 18 + Vite + Tailwind. One
  hardcoded event lives in `src/data.js` + `src/config.js`, rendered by a single
  four-tab screen (`src/App.jsx`). Scavenger checks persist in localStorage under one
  global key (`crawl-checks-v1`). Strict CSP ships via `public/_headers`; deploy is
  Cloudflare static assets (`wrangler.jsonc`). No tests, no routing, no provider.
- Reference — `../hero-slate`: a sibling that already walked this maturity curve
  (one bespoke page → many YAML records behind `getCharacter(id)`, per-device state
  behind a store interface, generated palette tokens, ADRs under `docs/decisions/`).
  Last Train Home mirrors its shape: `Crawl` ↔ `Character`, `getCrawl(id)` ↔
  `getCharacter(id)`, `static/crawls/<id>.yaml` ↔ `static/characters/<id>.yaml`.

## Scope, goals, non-goals

- **Scope**: migrate the working app to SvelteKit `adapter-static` and generalize its one
  hardcoded event into many YAML-defined crawls behind a provider, rendered at `/<id>`
  with a default crawl at `/`. Static, no backend; strict CSP preserved.
- **Goals**: render a crawl (schedule/venues/tasks/links/map) from YAML; many crawls by
  stable logical id; default crawl at `/`; per-device, per-crawl checklist; no future-DB
  traps (provider + state-store interfaces, definition vs state); theme tokens one source
  of truth; phone-first.
- **Non-goals (v1)**: in-app crawl editing, accounts / cross-device sync, live GPS /
  real-time group presence, in-app photo upload, a public index of all crawls, any
  backend.

## Personas

### The Crawler — the participant on the day

- **Who**: someone on the outing, on their **phone**, one hand, often walking or on a
  platform, connectivity spotty.
- **Goal**: know what's next and when to move, find the current stop, and tick off
  scavenger tasks to watch the group's points climb — with almost no reading.
- **Pain today**: the app works, but only for the one hardcoded event; a different outing
  means a different build. The checklist uses one global key, so a second crawl would
  overwrite the first's ticks on the same device.
- **Success looks like**: opens the shared link, lands on their crawl, taps through
  schedule / map / venues, ticks tasks; reopening later (even offline-ish) shows the same
  ticks, and a *different* crawl keeps its own.

### The Organizer / Author — the person who plans and publishes

- **Who**: the one who plans the outing, authors it, and shares the link. Usually a
  Crawler too on the day. Comfortable editing YAML on GitHub; not wanting to touch app
  code for each event.
- **Goal**: stand up a new crawl by writing one data file, set which crawl greets people
  at `/`, deploy, and share a clean link.
- **Pain today**: a "new crawl" means editing `src/data.js`/`src/config.js` (code, not
  data) and effectively forking the app; there is no id, no route, no second record.
- **Success looks like**: adds `static/crawls/<id>.yaml`, the crawl is live at `/<id>`,
  the default at `/` is a one-line change, and no component changed.

> **Implication**: the Organizer is a Crawler who also authors. Build one crawl-rendering
> experience; authoring is "add a YAML file," not a separate app surface.

## Journey Map

Migration of a **working** app: several stages are `supported` for the *one* event today
but `partial` for *many* crawls — the gap is multiplicity and per-crawl isolation, not a
missing screen.

**Crawler journey:**

```
  Open the    See the     Find the    Track       Reopen      Use with a
  link     ─► plan     ─► stop     ─► tasks    ─► later     ─► weak signal
     │          │           │           │           │            │
  partial    supported   supported    partial     partial       gap
```

1. **Open the link** — `/` renders the app — partial (only one hardcoded crawl; no id, no `/<id>`)
2. **See the plan** — schedule timeline — supported (for the one event; `src/App.jsx` `ScheduleView`)
3. **Find the stop** — map embed + venue list with directions — supported (`MapView`, `VenuesView`)
4. **Track tasks** — tap scavenger checklist, points tally — partial (works, but one global localStorage key `crawl-checks-v1`)
5. **Reopen later** — ticks persist across reloads — partial (persists, but not isolated per crawl)
6. **Use with a weak signal** — resilient on flaky connections — gap (static files, but no offline/PWA caching)

**Author journey:**

```
  Author a    Add a       Set the      Deploy    Iterate
  crawl    ─► second   ─► default   ─► the     ─► on edits
     │        crawl        (/)         site
     │          │           │           │           │
  partial      gap         gap      supported    partial
```

1. **Author a crawl** — describe the event — partial (it's code in `src/data.js`/`config.js`, not a data file)
2. **Add a second crawl** — a new, independent event — gap (no id/route/record; would fork the app)
3. **Set the default (`/`)** — choose which crawl greets people — gap (no concept of default or of multiple)
4. **Deploy the site** — build + publish static assets — supported (Vite build; `wrangler.jsonc`, Cloudflare)
5. **Iterate on edits** — change land after publish — partial (edit code + rebuild, rather than edit a data file)

## MoSCoW

### Must

- **SvelteKit `adapter-static` shell at parity, strict CSP preserved** — Crawler "open /
  see / find / track"; the migration itself. Nothing else can be built on the old
  framework, and the CSP is load-bearing to the project's stated posture.
- **Crawl behind a `getCrawl(id)` provider interface** — Author "author a crawl"; the
  boundary that lets one record become many without rippling through the UI.
- **YAML-driven crawl + `/<id>` routing + default crawl at `/`** — Author "add a second
  crawl / set the default"; Crawler "open the link." This is where multiplicity becomes
  real and a shareable link exists.
- **Per-device, per-crawl checklist behind a state-store interface** — Crawler "track /
  reopen." Isolates ticks per crawl (today's global key would collide) and is the second
  half of the no-future-DB-traps safety.

### Should

- **Generic itinerary schedule + per-crawl links & map** — Crawler "see the plan" for
  *any* crawl; realizes "walking is just a mode" and un-hardcodes Ventra/Metra and the
  map so a non-train crawl renders correctly.
- **Per-crawl theming (authored accent → palette, one token source, WCAG AA)** — Crawler
  "see the plan / find the stop"; lets each crawl look distinct on the station-board base
  without hand-edited colors going unreadable.
- **A second, non-Metra crawl authored end-to-end** — Author "add a second crawl"; proves
  the generalization and flushes out schema gaps before they calcify.

### Could

- **Offline / PWA caching** — Crawler "use with a weak signal"; resilience for platforms
  and dead zones. Deferred: static shell already tolerates brief drops.
- **Unlisted / `noindex`** — cheap privacy so crawls aren't search-indexed.
- **Manifest-driven picker at `/`** — a front door beyond "default + direct link," only
  if crawls ever want to be browsed.

### Won't (this release)

- In-app crawl editing; accounts / cross-device sync; live GPS / real-time presence;
  in-app photo upload; a public index of all crawls; a backend. These are the v1
  non-goals; the provider + state-store interfaces leave room for the hosted phase later
  without designing it now.

## Stories

Ordered release checklist. One story = one OpenSpec change (proposal ≈ 200 words).
Every story is a thin vertical slice — end-to-end and demoable, never a horizontal layer.
The app **stays working at every rung**; the migration de-risks framework + CSP first,
then multiplicity, then generalization. New paths use SvelteKit conventions
(`src/routes`, `src/lib`, `static/`); ADRs land under `docs/decisions/` with the story
that introduces each constraint.

- [x] 1. `sveltekit-shell-parity` — the same four-tab app runs on SvelteKit, under the strict CSP
  - **Persona served**: Crawler
  - **Journey segment**: Crawler "open the link → see the plan → find the stop → track tasks" (re-platformed, one event)
  - **MoSCoW**: Must
  - **Why this story / why now**: walking skeleton for the migration — proves the framework and, critically, the **CSP** before anything else is built on it. SvelteKit's prerendered shell normally injects an inline bootstrap `<script>`; `script-src 'self'` with no `'unsafe-inline'` forbids it. Resolving that (`kit.csp` hashing, with header-only directives in `static/_headers`) is the load-bearing spike and belongs first.
  - **Depends on**: nothing
  - **Scope**: in: replace React+Vite with SvelteKit + `adapter-static` (`ssr = false`, prerendered shell, SPA fallback); port the four-tab shell and all views (`ScheduleView`/`MapView`/`VenuesView`/`TasksView`) to Svelte 5 components at visual parity; convert Tailwind to native Svelte scoped CSS (resolves Open Question 4 — see below); keep the single crawl hardcoded (still a module); preserve the strict CSP and prove it on the built output; stand up Vitest + `@testing-library/svelte`; ADRs: static-first SvelteKit, and the CSP hashing mechanism. / out: provider interface, YAML, routing/ids, per-crawl state, theming or schedule changes.
  - **Relevant code**: `src/App.jsx`, `src/main.jsx`, `src/index.css`, `src/config.js`, `src/data.js`, `index.html`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `public/_headers`, `wrangler.jsonc` → new `svelte.config.js`, `vite.config.ts`, `src/app.html`, `src/routes/+layout.*`, `src/routes/+page.svelte`, `src/lib/**`, `docs/decisions/`.
  - **Added**: 2026-09-20
  - **Change**: archived 2026-09-21 — `openspec/changes/archive/2026-09-21-sveltekit-shell-parity/`

- [x] 2. `crawl-provider-interface` — the rendered event comes from `getCrawl(id)`, not a direct import
  - **Persona served**: Author (enables), Crawler (unchanged)
  - **Journey segment**: Author "author a crawl" (the boundary); no visible change
  - **MoSCoW**: Must
  - **Why this story / why now**: introduces the seam that turns one event into many. Views must stop importing data directly and depend only on the interface, so later stories can swap the source (YAML, then a DB) without touching components. Mirrors the sibling's provider ADR.
  - **Depends on**: story 1
  - **Scope**: in: a `Crawl` type split into identity (validated: `id`, `title`, optional `date`, `color`) and definition (schedule/venues/tasks/links/map, carried through); a `CrawlProvider` interface with `getCrawl(id)` returning a found/not-found/invalid/error result; an in-repo implementation wrapping today's hardcoded data as the single record; views consume only `getCrawl(id)`; ADR: crawl behind a provider. / out: YAML loading, routing, files on disk, multiple records.
  - **Relevant code**: new `src/lib/data/provider.ts`, `src/lib/types.ts`; the ported views from story 1; `docs/decisions/`.
  - **Added**: 2026-09-20
  - **Change**: archived 2026-09-21 — `openspec/changes/archive/2026-09-21-crawl-provider-interface/`

- [x] 3. `yaml-crawl-routing` — crawls load from YAML; `/<id>` renders any, `/` renders the default
  - **Persona served**: Author, Crawler
  - **Journey segment**: Author "add a second crawl → set the default"; Crawler "open the link"
  - **MoSCoW**: Must
  - **Why this story / why now**: the rung where multiplicity becomes real and a shareable link exists. The record moves out of code into `static/crawls/<id>.yaml`, fetched at runtime through the provider; `/<id>` resolves any crawl and `/` renders the app-configured default (`cory-trent`). First point two crawls can coexist.
  - **Depends on**: story 2
  - **Scope**: in: a YAML provider implementation reading `static/crawls/<id>.yaml`; the seed event authored as `static/crawls/cory-trent.yaml`; dynamic route `src/routes/[id]` (client-resolved, `ssr = false`, SPA fallback); `/` renders an app-level `defaultCrawl`; no public directory listing; ADRs: static-first serving of `/<id>`, YAML as the v1 source. / out: per-crawl state isolation (story 4), schedule generalization (story 5), theming (story 6).
  - **Relevant code**: `src/lib/data/provider.ts` (+ a `yaml.ts` loader), `static/crawls/cory-trent.yaml`, `src/routes/+page.*`, `src/routes/[id]/+page.*`, app-level default config, `wrangler.jsonc` SPA-fallback settings.
  - **Added**: 2026-09-20
  - **Change**: archived 2026-09-22 — `openspec/changes/archive/2026-09-22-yaml-crawl-routing/`

- [x] 4. `per-crawl-checklist-state` — scavenger ticks persist per device and per crawl, behind an interface
  - **Persona served**: Crawler
  - **Journey segment**: Crawler "track tasks → reopen later" (isolated per crawl)
  - **MoSCoW**: Must
  - **Why this story / why now**: with two crawls now possible, the single global localStorage key would let one crawl's ticks clobber another's on the same device. Moving state behind a key-value interface keyed by crawl id fixes that and completes the no-future-DB-traps safety (a remote store becomes a swap).
  - **Depends on**: story 3
  - **Scope**: in: a state-store interface (`loadChecks(id)` / `saveChecks(id, …)`); a localStorage implementation keyed `crawl-checks:<id>`; migrate today's `useChecks` logic behind it; reconcile stored ticks against the crawl's current task ids on load; ADR: per-device state behind a store interface. / out: cross-device sync, non-checklist state, reset UI changes.
  - **Relevant code**: today's `useChecks` in `src/App.jsx` → `src/lib/state/store.ts` + `src/lib/state/localStorage.ts`; the Tasks view; `docs/decisions/`.
  - **Added**: 2026-09-20
  - **Change**: archived 2026-09-23 — `openspec/changes/archive/2026-09-23-per-crawl-checklist-state/`

- [ ] 5. `generic-itinerary` — the schedule renders any timed crawl; links and map are per-crawl data
  - **Persona served**: Crawler, Author
  - **Journey segment**: Crawler "see the plan" for a non-train crawl; Author "author a crawl"
  - **MoSCoW**: Should
  - **Why this story / why now**: today's schedule bakes in train verbs (`depart`/`arrive`/`stop`) and hardcodes Ventra/Metra and the map in `config`. To be a renderer for *any* timed crawl, an entry becomes a generic **stop** or **move** with an author-written `mode` (walking is one), and links/map become per-crawl fields. Do it after YAML exists so the schema change lands in one place.
  - **Depends on**: stories 2, 3
  - **Scope**: in: schedule as an ordered list of author-driven `stop` / `move` / note entries, `mode` free text (no transit enum); an authored `links[]` (`label`, `hint`, `url`) replacing hardcoded Ventra/Metra; `map` (embed + app url) per crawl; resolver drops malformed entries; `cory-trent.yaml` migrated to the shape. / out: routing/state changes, theming, a second crawl.
  - **Relevant code**: schedule/links/map resolvers under `src/lib/character`-equivalent (`src/lib/crawl/*`), the Schedule and Map views, `static/crawls/cory-trent.yaml`.
  - **Added**: 2026-09-20
  - **Change**: _not yet proposed_

- [ ] 6. `per-crawl-theming` — each crawl carries an accent that resolves to an accessible palette
  - **Persona served**: Crawler, Author
  - **Journey segment**: Crawler "see the plan / find the stop" (legibility, identity)
  - **MoSCoW**: Should
  - **Why this story / why now**: today one fixed station-board look is baked into `index.css`. Letting a crawl author a `color` (resolved to a palette, neutral fallback for an unknown name) gives each event identity without hand-typed hex going unreadable. Tokens live in one source of truth with AA-checked pairs, mirroring the sibling.
  - **Depends on**: story 3
  - **Scope**: in: a named palette as the single source of truth (light + dark), generated CSS tokens; resolve a crawl's `color` onto the station-board base; `prefers-color-scheme` auto light/dark; AA contrast enforced by tests reading the emitted CSS; ADR: theme tokens one source of truth. / out: a user-facing theme toggle, per-entry colors, new data beyond `color`.
  - **Relevant code**: `src/index.css` → `src/lib/theme/*` (palette source + generated CSS + resolve + tests), the layout and views.
  - **Added**: 2026-09-20
  - **Change**: _not yet proposed_

- [ ] 7. `second-crawl-proof` — a second, non-Metra crawl ships end-to-end
  - **Persona served**: Author, Crawler
  - **Journey segment**: Author "add a second crawl"; Crawler "open the link" (a different crawl)
  - **MoSCoW**: Should
  - **Why this story / why now**: proves the whole thesis — that a new outing is one YAML file, no code — and exercises "walking is just a mode" against a real record. Authoring a genuinely different crawl (e.g. a downtown walking pub crawl, no train) surfaces any remaining train-shaped assumptions before they calcify.
  - **Depends on**: stories 4, 5, 6
  - **Scope**: in: author `static/crawls/<id>.yaml` for a non-transit walking crawl (walk-mode moves, its own links/map/tasks/color); confirm it renders at `/<id>` with isolated checklist state; fix any schema or rendering gaps it reveals. / out: switching the default away from `cory-trent`, new features, a picker.
  - **Relevant code**: `static/crawls/<new-id>.yaml`; whichever resolver/view the new record stresses.
  - **Added**: 2026-09-20
  - **Change**: _not yet proposed_

## Open Questions

- **CSP mechanism** (resolve in story 1): the exact way SvelteKit's inline bootstrap is
  kept under `script-src 'self'` — `kit.csp` hash mode injected into the shell, versus the
  header served from `public/_headers` / `wrangler`. Either must produce a build that
  passes the no-`'unsafe-inline'` check.
- **`cory-trent` content** (resolve in story 3): whether the seed YAML carries the current
  Palatine/Metra itinerary verbatim or is re-authored for the `cory-trent` group; either
  way it is the first record and the default at `/`.
- **Default-crawl config location** (resolve in story 3): an app-level constant vs. a tiny
  config file vs. an env value — one small setting, but name where it lives.
- **Tailwind vs. scoped CSS** (resolved in story 1): converge on the sibling's plain scoped
  CSS. The app is small, scoped CSS is the sibling's idiom and a clean base for the theming
  story, and the CSP work does not depend on the styling idiom. The cost is a one-time
  utility-to-CSS rewrite plus a parity check. Reversible.

## Change Log

- 2026-09-21 — Reconciled completed OpenSpec changes. Marked the SvelteKit shell and crawl-provider stories as archived, so the next unchecked story is YAML crawl routing.
- 2026-09-20 — Initial plan from `openspec/prd.md`. Two personas (Crawler, Organizer/
  Author); Crawler + Author journey maps annotated against the working React app; MoSCoW;
  7 stories cutting the migration into thin vertical slices (framework+CSP → provider →
  YAML+routing → per-crawl state → generic itinerary → theming → second-crawl proof).
  Discovery marked complete.
