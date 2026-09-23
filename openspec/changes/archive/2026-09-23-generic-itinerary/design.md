## Context

See `proposal.md` for the problem. The provider returns a crawl with validated identity and an unchanged definition. The build validates the authored YAML against the fields that views need. `ScheduleView` currently interprets `depart` as the only movement kind and supplies two fixed train links. `MapView` reads two Google Maps fields directly. The current CSP allows frames from `https://www.google.com`.

The YAML record keeps its `definition` envelope under ADR 0004. This story changes fields inside that envelope. The provider, route, checklist store, and CSP remain in place.

## Goals / Non-Goals

**Goals:**

- Give authors one timed schedule shape for stops, moves, and notes.
- Keep the seed event's order, wording, links, and map destinations visible after migration.
- Keep a malformed runtime schedule entry from breaking the page.
- Reject unsafe URLs before publication and before runtime rendering.

**Non-Goals:**

- Accepting legacy schedule kinds or URL fields after the migration.
- Adding another map embed provider or changing the CSP.
- Reworking venue directions, scavenger tasks, checklist state, or theme tokens.
- Authoring the second crawl; that remains story 7.

## Decisions

### Keep the new fields inside `definition`

Use `definition.schedule`, `definition.links`, and `definition.map`. Each schedule entry has `kind`, `time`, and `title`. A move also has `mode`. Any entry can have an authored `tag` or `note`. A move shows its mode, then its optional note. The view supplies `Stop`, `Move`, or `Note` when a tag is absent. This keeps the existing provider contract and the chosen YAML envelope. A flat record would contradict ADR 0004 and require provider reshaping.

The map has required `embed` and `app` fields. `app` names the viewer destination; the browser may hand that URL to a native app. Links are required as an array but may be empty. The link cards wrap on narrow screens when more than two are present. Requiring a map matches the current Map tab. Allowing no links supports a walking crawl without empty cards. The album link stays with scavenger content for this story.

### Resolve definition meaning in the views' domain layer

Add pure resolvers under `src/lib/crawl/` for schedule, links, and map. They accept unknown input even though the authored definition has TypeScript types. A missing or non-array schedule resolves to an empty timeline with an unavailable message. A malformed entry is dropped while valid siblings keep their order. A missing or non-array link list resolves to an empty list. A link with missing text or an unsafe URL is dropped while valid siblings remain. A missing or malformed map resolves to no frame or viewer link and a neutral unavailable message. The shell and other tabs remain usable. The provider continues to validate identity only.

The build validator checks every authored entry and rejects malformed records with a field path. Runtime tolerance protects the page if an old cached record, manual test provider, or later hosted source bypasses build validation. Moving all definition checks into the provider would break its identity-only contract. Silently dropping bad entries during the build would conceal authoring mistakes.

### Use one URL policy for build and runtime

Share a pure URL policy between validation and rendering. Quick links accept absolute HTTP or HTTPS URLs. Map URLs require the exact parsed origin `https://www.google.com`, including its default port. Embed paths equal `/maps/d/embed` or `/maps/embed`, or sit beneath those path segments. Viewer paths begin `/maps/` but cannot be embed paths. Compare parsed origin and path rather than string prefixes. This rejects reversed URL roles, non-default ports, `javascript:` links, and lookalike hosts such as `www.google.com.evil.example`. The allowed embed origin matches the current CSP, so this story needs no CSP change.

### Migrate the seed record in one release

Map `arrive` and `stop` to `stop`, `depart` to `move`, and `warning` to `note`. Rename `t` to `time` and `sub` to `note` or `mode` as appropriate. Retain authored tags. Move Ventra and Metra into `links` in their current order. Move the existing map destinations into `map.embed` and `map.app`. Leave the header, venues, tasks, rules, and album values unchanged. Update the seed fixture and parity checks to compare visible wording, destinations, and ordered entries after migration. The crawl-provider preservation requirement changes with this schema migration; it no longer requires obsolete field names.

## Risks / Trade-offs

- **A stale YAML record still has old fields** → Runtime resolvers keep the page mounted and omit unusable schedule, link, or map content. YAML assets already use cache revalidation. The new build rejects old records before deployment.
- **A URL looks like a Google URL but points elsewhere** → Parse its hostname and require the exact supported origin and Maps path.
- **A malformed map leaves the Map tab empty** → Show a short unavailable message while omitting unsafe frame and link elements.
- **The seed migration alters visible wording** → Compare every migrated schedule item, link destination, and map URL against the pre-migration fixture.

## Migration Plan

Write failing tests for the new shapes and runtime fallbacks. Update types, resolvers, views, build validation, and the seed YAML together. Run tests, type checks, crawl validation, and the static build before opening the implementation PR. Deploy the app and YAML assets as one static release. Roll back by redeploying the prior release; no stored user state changes.
