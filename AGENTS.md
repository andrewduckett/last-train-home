# AGENTS.md

Guidance for AI agents working in this repo. `CLAUDE.md` imports this file.

## What this is

Last Train Home renders **timed "crawls"** — themed, multi-stop outings — from
hand-edited YAML, as a static web app with no backend. A crawl is a schedule
(a stop-and-move itinerary), venues, a scavenger checklist with points, quick
links, and an embedded map. The app renders **many** crawls, each addressed by a
stable logical id (`/cory-trent`), with a default crawl served at `/`. The product
intent lives in `openspec/prd.md`; the release plan and milestone status live in
`openspec/discovery.md`.

> **Migration in progress.** The repo currently ships the pre-migration app —
> React 18 + Vite + Tailwind, one hardcoded event in `src/data.js`, rendered by
> `src/App.jsx`. The first discovery story (`sveltekit-shell-parity`) swaps the
> framework to SvelteKit; the constraints and toolchain below describe the
> **target** every change moves toward. Where a target tool does not exist yet
> (tests, `check`, palette generation), that is the migration not being finished,
> not a license to skip it once it lands.

## Durable constraints (honor in every change)

- **Static-first, no backend this release.** The site builds to pure static assets
  with SvelteKit `adapter-static`: a prerendered app shell, `ssr = false`, and an
  SPA fallback for clean `/<id>` paths. It ships **no** server code. To add server
  rendering later, swap the adapter — not the framework.
- **Preserve the strict CSP.** The site serves under `script-src 'self'` with **no
  `'unsafe-inline'` scripts** — a deliberate security posture, not an artifact of the
  old build. SvelteKit's inline bootstrap must be reconciled with this (via `kit.csp`
  hashing or equivalent). The policy ships with the build (today `public/_headers`);
  every accent/font/script stays same-origin.
- **Crawl data sits behind a provider interface.** Consumers depend only on
  `getCrawl(id)`, never on a file path or URL. A crawl is a **stable logical id**
  (e.g. `cory-trent`), not a filename, so it resolves to a YAML file today and a
  hosted record tomorrow. Keep palette and rendering knowledge out of the provider.
- **No future-DB traps.** A later phase may add a hosted database, accounts, and
  cross-device sync. Keep **definition** data (the crawl) separate from **per-device
  state** (the checklist), keep types JSON-clean, key state by logical id behind a
  state-store interface, and route everything through the provider so that move swaps
  one seam rather than rippling through every screen.
- **Validate at the boundary, resolve in the layer that owns meaning.** The provider
  validates identity as data (`title` required; `date`, `color` optional and
  type-checked) and carries the definition through unresolved. Domain layers interpret
  it — the theming layer resolves a `color` name to a palette and falls back to a
  neutral station-board accent, so a bad name never breaks a crawl; the schedule layer
  drops a malformed entry rather than failing the page.
- **Schedules are author-driven, not transit-shaped.** A schedule entry is a `stop`
  or a `move`; a move's `mode` is authored free text (a train leg and a "15 min walk"
  are the same shape). The app hardcodes no transit vocabulary — walking is just a mode.
- **Theme tokens have one source of truth.** The palette source file is the only place
  color values live; the emitted CSS is **generated** and never hand-edited. Light/dark
  is a pure `prefers-color-scheme` media query, and every accent/on-accent and
  foreground/surface pair meets WCAG AA — enforced by tests that read the emitted CSS.
- **Phone-first.** The design target is a portrait phone, one-handed, outdoors; big tap
  targets, near-zero reading to operate. Tablet/desktop are a responsive bonus.

## Toolchain

- **Runtime:** Node per `.nvmrc`. **Package manager:** npm (`package-lock.json`).
- **Framework (target):** SvelteKit + Svelte 5 (runes), TypeScript, Vite. **Today:**
  React 18 + Vite + Tailwind (pre-migration).
- **Tests (target):** Vitest + `@testing-library/svelte` in a jsdom environment.
- **Data:** `yaml`. **Deploy:** Cloudflare static assets via `wrangler`.

Target commands (as the migration lands them in `package.json`):

```bash
npm run dev              # vite dev server                  (exists today)
npm run build            # generate palette, then static build (build exists today)
npm run preview          # preview the production build      (exists today)
npm test                 # vitest run (the full suite)       (arrives in story 1)
npm run check            # svelte-kit sync + svelte-check     (arrives in story 1)
npm run generate:palette # rewrite generated palette CSS      (arrives in the theming story)
npm run deploy           # build + wrangler deploy
```

Before opening a PR, run the tests and the build locally and confirm both are green;
local verification is the gate. Practice TDD: write the failing test first, then make
it pass.

## Workflow

- Planning uses **OpenSpec**: in-flight work lives under `openspec/changes/`;
  durable specs under `openspec/specs/`; decision records under `docs/decisions/`. Use
  the `opsx:*` skills (propose → apply → verify → archive). Pick the next unchecked
  story in `openspec/discovery.md`; one story = one change.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).

### OpenSpec git workflow

One branch and one pull request carry a change through its whole lifecycle —
propose, apply, verify, archive — and merge once. There is no "cross `main`
between phases" step.

- **Branch per change.** One OpenSpec change (one discovery story) = one branch =
  one PR. Dependent stories **stack**: branch off the parent's branch and target
  its PR; independent stories branch off `main`.
- **A commit per unit of work.** Each artifact (proposal, design, specs, tasks) is
  its own `docs:` commit; each implementation task is its own commit with its real
  type (`feat:`/`fix:`/`refactor:`/`test:`); the archive is its own `chore:` commit.
- **Draft until archived.** Open the PR as a draft at propose. Run propose → apply →
  verify → archive all on the branch; `archive` moves the change to
  `openspec/changes/archive/` and syncs delta specs into `openspec/specs/`. Flip the
  PR to ready when the archive commit lands.
- **User owns the merge.** The agent never merges a PR unless explicitly asks and 
  confirmed. Stacks merge bottom-up: parent to `main` first, then retarget and merge 
  each child.
- **If a ready PR gets change-requests,** flip it back to draft and `git revert` the
  archive commit — this restores the change under `openspec/changes/` and unwinds the
  spec sync. Make the fixes, re-archive as the last commit, and flip ready again. A
  rejected PR is just closed and its branch deleted; `main` stays clean.
- **Issue provenance.** When a change originates from a GitHub issue, discovery
  records `Origin: #<issue>` on the story and propose carries it into `proposal.md`.
  A PR that fully resolves a single issue says `Closes #<issue>`; a PR that is one of
  many stories under an epic or milestone issue says `Part of #<issue>`, and that
  parent issue is closed only once `discovery.md` shows all its stories archived.

## Writing document artifacts — plain language

Write every document artifact — READMEs, ADRs, GitHub issue bodies/designs, `docs/`,
PR descriptions, and other prose deliverables — to the **ISO 24495 Plain Language**
standard: reader-first, purposeful structure, findable, understandable, and
actionable. Apply the core standard (`iso-24495-1`) to all prose, and the
science/technical sector standard (`iso-24495-3`) to architecture specs, design docs,
and software documentation. This governs prose only — code, config, and test fixtures
follow the toolchain's own conventions.

## Scratch & Working Files

Temporary files — scratch notes, intermediate output, working scripts, throwaway data — go in
**`.workspace/`** at the repo root. It is gitignored (see `.gitignore`). **Use it instead of `/tmp`
or any scratchpad path your tooling suggests** — this convention overrides a harness-provided
scratchpad location. Create the directory if it isn't there (`mkdir -p .workspace`). Nothing durable
lives here; anything worth keeping belongs in the repo tree or a GitHub issue.
