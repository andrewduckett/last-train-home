# Discovery: Last Train Home — a renderer for many timed crawls

The living map behind the backlog: who it serves and the journeys it supports.
The product intent lives in `openspec/prd.md`. Stories are GitHub issues.

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

Annotated against the code today. The app renders any crawl authored in
`static/crawls/<id>.yaml` at `/<id>`, with the default crawl (`defaultCrawl` in
`src/lib/config.ts`) at `/`.

**Crawler journey:**

```
  Open the    See the     Find the    Track       Reopen      Use with a
  link     ─► plan     ─► stop     ─► tasks    ─► later     ─► weak signal
     │          │           │           │           │            │
  supported  supported   supported   supported   supported      gap
```

1. **Open the link** — `/<id>` or `/` renders the crawl — supported (`src/routes/[id]`, `src/lib/CrawlRoute.svelte`)
2. **See the plan** — the stop-and-move timetable, plus an Info tab for the intro and links — supported (`ScheduleView`, `InfoView`)
3. **Find the stop** — map embed + venue list with directions — supported (`MapView`, `VenuesView`)
4. **Track tasks** — tap scavenger checklist, points tally — supported (`TasksView`, keyed `crawl-checks:<id>` behind `src/lib/state/store.ts`)
5. **Reopen later** — ticks persist per device and per crawl — supported (`src/lib/state/localStorage.ts`)
6. **Use with a weak signal** — resilient on flaky connections — gap (static files, but no offline caching; [#17](https://github.com/andrewduckett/last-train-home/issues/17))

**Author journey:**

```
  Author a    Add a       Set the      Deploy    Iterate
  crawl    ─► second   ─► default   ─► the     ─► on edits
     │        crawl        (/)         site
     │          │           │           │           │
  partial    partial    supported   supported   supported
```

1. **Author a crawl** — describe the event in one YAML file — partial (works, but venue and scavenger fields use one-letter keys; [#15](https://github.com/andrewduckett/last-train-home/issues/15))
2. **Add a second crawl** — a new, independent event — partial (supported by routing and per-crawl state, but no second crawl has been authored yet; [#16](https://github.com/andrewduckett/last-train-home/issues/16))
3. **Set the default (`/`)** — choose which crawl greets people — supported (one line: `defaultCrawl` in `src/lib/config.ts`)
4. **Deploy the site** — build + publish static assets — supported (`npm run build` validates every crawl; `wrangler.jsonc`, Cloudflare)
5. **Iterate on edits** — changes land after publish — supported (edit the YAML, rebuild, redeploy)

## Backlog

Stories are GitHub issues: https://github.com/andrewduckett/last-train-home/issues.
