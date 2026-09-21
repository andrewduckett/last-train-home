# PRD: Last Train Home — a renderer for many timed crawls

**Status:** Draft · **Date:** 2026-09-20 · **Author:** Andrew Duckett

## 1. Background & Problem

We built a mobile-first coordinator for one suburban Metra bar crawl: a schedule,
a route map, a venue list, and a localStorage scavenger checklist. It works and it
ships as tight static files under a strict Content-Security-Policy. But it is one
bespoke event, hardcoded in `src/data.js` and rendered by a single React screen.

We want to run this kind of outing again — different people, different route,
different stops, sometimes no train at all. Today that means copying the repo and
editing code. The event data, the app title, the map, and the quick links are all
tangled together, so a second crawl is a fork rather than a file.

This release inverts that. Last Train Home becomes a **renderer for many crawls**.
A crawl is a themed, multi-stop, timed outing described in hand-edited YAML; the
app renders any of them. The current event becomes the first record, not the app.

This is the same maturity curve a sibling project (Hero Slate) already walked: one
bespoke page → a renderer for many records behind a provider interface, with
per-device state kept separate so a hosted database can arrive later without a
rewrite.

## 2. Goals

- Render a **crawl** from a hand-edited YAML record: title, schedule, venues,
  scavenger tasks, quick links, and an embedded map.
- Support **many crawls**, each addressed by a **stable logical id** (`/cory-trent`),
  never a filename.
- Serve the **default crawl at `/`** — for now, `cory-trent` — so a group opens one
  link and lands on their event.
- Stay a **static web app**: no backend, no server code this release.
- Keep the **strict CSP** (`script-src 'self'`, no `'unsafe-inline'` scripts) — it is
  the project's stated security posture, not an accident of the old build.
- Leave **no future-database traps**: definition data, per-device state, and rendering
  each sit behind their own boundary.

## 3. Non-Goals (v1)

Explicitly out of scope for the first version:

- **In-app crawl editing** — crawls are authored by editing YAML on GitHub.
- **Accounts and cross-device sync** — the scavenger checklist stays per-device.
- **Live location / GPS / real-time group presence** — the map is a static embed.
- **In-app photo capture or upload** — the group album is an external link.
- **A public index of all crawls** — crawls are shared by link, not enumerated.
- **A backend of any kind** — deferred to a possible later phase, not designed away.

## 4. Users & Context

- **The Crawler** — a participant on the day, on their **phone**, one hand, moving.
  Wants: what's next, when to leave, where the stop is, and a way to tick off
  scavenger tasks. Near-zero reading; big tap targets; works while walking.
- **The Organizer / Author** — the person who plans the outing, authors the crawl in
  YAML, sets it as the default, and shares the link. Often also a Crawler on the day.
- **Primary device:** **portrait phone**, outdoors, one-handed. Responsive up to
  tablet/desktop as a bonus; phone-portrait is the design target.
- **Connectivity:** spotty on platforms and between towns. The last-opened crawl and
  the checklist must survive a dead zone; a static app shell helps.

## 5. Product Overview

A static site that:

1. Renders the **default crawl at `/`** (today, `cory-trent`) and **any crawl at
   `/<id>`**, both through one data-provider path — no public directory listing.
2. Shows a crawl as four tabs — **Schedule, Map, Venues, Tasks** — the same shell the
   current app uses, ported to the new framework.
3. Lets a Crawler **tick scavenger tasks**, with a running points tally, **persisted
   per device and per crawl** so two crawls never collide.
4. Themes each crawl with an **authored accent** on the shared station-board base,
   auto light/dark following the device.

## 6. The crawl model

A crawl record splits into three tiers, mirroring the sibling project so the same
future-proofing holds.

### 6.1 Identity (validated at the boundary)

- `id` — stamped from the request id, never trusted from the file.
- `title` — required, non-empty. Drives the header and the browser tab.
- `date` — optional, printed as authored.
- `color` — optional palette name; the theming layer resolves it and falls back to a
  neutral station-board accent when the name is unknown.

### 6.2 Definition (each part resolved by the layer that owns it)

- **schedule** — an ordered itinerary of entries. Two rough shapes, author-driven, no
  fixed transit vocabulary:
  - a **stop** — "you are somewhere" (a time, a title, an optional venue).
  - a **move** — "you are going somewhere" — a timed transition in **any mode**. A
    train leg (`"Inbound train → Mt. Prospect, platform 2"`) and a walk
    (`"15 min walk to the lamp post by 3:40"`) are the same shape; the mode is
    authored free text, not an enum the app hardcodes.
  - soft **notes / wrap-ups** ("close out your tab") render as nudges.
- **venues** — stops, each with a town and one or more places (`name`, `address`); the
  app builds a directions link per place.
- **tasks** — a scavenger list (`id`, `title`, `description?`, `points`) plus freeform
  rules text; the app renders a checklist and a points tally.
- **links** — an authored set of quick links (`label`, `hint`, `url`). Ventra and Metra
  are just the two links *this* crawl happens to list; a walking crawl lists none.
- **map** — an embedded map URL and an "open in app" URL, per crawl.

### 6.3 Per-device state (behind a key-value interface)

- The **scavenger checklist** — which tasks are ticked — stored in localStorage,
  **keyed per crawl id**, behind a state-store interface. It survives refresh and
  close, stays per-device this release, and is the seam a future hosted store slots
  into.

### 6.4 Example crawl (illustrative)

```yaml
id: cory-trent
title: Last Train Home
date: 2026-10-17
color: rail

links:
  - label: Ventra
    hint: Buy & show your pass
    url: https://www.ventrachicago.com/app/
  - label: Metra
    hint: Live train schedules
    url: https://www.metra.com/schedules?line=UP-NW&allstops=0

map:
  embed: https://www.google.com/maps/d/embed?mid=...
  app: https://www.google.com/maps/d/viewer?mid=...

schedule:
  - kind: stop
    time: "2:45 PM"
    title: Meetup — Palatine Station
    note: 137 W. Wood St
  - kind: move
    time: "3:12 PM"
    title: Depart Palatine
    mode: Inbound train → Mt. Prospect
  - kind: stop
    time: "3:25 PM"
    title: Stop 1 · Mt. Prospect
    venue: Station 34

venues:
  - stop: Stop 1
    town: Mt. Prospect
    places:
      - name: Station 34
        address: 34 S Main St

tasks:
  rules:
    - Every challenge counts once it is posted to the shared album.
  items:
    - id: platform-selfie
      title: The Platform Selfie
      points: 10
      description: Group selfie under an official station name sign.
```

## 7. Configuration format

- **YAML**, hand-edited on GitHub, comments encouraged.
- **One file per crawl**: `static/crawls/<id>.yaml`.
- A single app-level setting names the **default crawl** rendered at `/`.
- Adding a crawl is one new file (plus setting it default when it should own `/`).

## 8. Architecture (future-proofing)

The load-bearing constraint: **do not trap ourselves** before a possible hosted phase.

- **Data-provider interface** — `getCrawl(id)` returns a validated record. The v1
  implementation fetches YAML; a future one calls an API. The UI depends only on the
  interface, never on a path or URL.
- **State-store interface** — load and save the per-crawl checklist. v1 is localStorage;
  a future remote store is a swap, and the seam cross-device sync would use.
- **Definition vs. state** kept strictly separate and independently serializable.
- **Logical ids** everywhere — URLs and storage keys, never filenames.
- **Stable, JSON-clean schema** — YAML maps cleanly onto a future JSON API.

## 9. Tech stack & deployment

- **Framework:** SvelteKit + Svelte 5 (runes), TypeScript, Vite.
- **Build:** `adapter-static` — a prerendered app shell, `ssr = false`, an SPA fallback
  for clean paths. No server code ships. (Server rendering later swaps the adapter, not
  the framework.)
- **Styling:** the current station-board look, carried over; theme tokens live in one
  source of truth and every accent/foreground pair meets WCAG AA.
- **Tests:** Vitest + `@testing-library/svelte` in jsdom. TDD: failing test first.
- **CSP:** the strict policy is preserved. SvelteKit's inline bootstrap script must be
  reconciled with `script-src 'self'` (via `kit.csp` hashing, or an equivalent) — this
  is proven in the first story before the ladder commits.
- **Hosting:** Cloudflare, static assets, SPA fallback for `/<id>` paths.

## 10. Success criteria

- A Crawler opens the shared link, lands on the default crawl, taps through schedule /
  map / venues, and ticks scavenger tasks — one-handed, on a phone, offline-tolerant.
- An Organizer stands up a second crawl by adding one YAML file — no code changes.
- The built site still serves under `script-src 'self'` with no `'unsafe-inline'`
  scripts.
- Moving to a hosted database later swaps the provider and state-store implementations,
  not the UI.

## 11. Open questions / future

- **CSP reconciliation** — confirm the exact mechanism that keeps SvelteKit's shell
  under `script-src 'self'` (resolve in the first story).
- **A picker at `/`** — if crawls ever want a front door beyond a default and direct
  links, a manifest-driven picker could arrive later; unlisted-by-default for now.
- **Cross-device sync and accounts** — the future hosted phase; left un-trapped, not
  designed.
