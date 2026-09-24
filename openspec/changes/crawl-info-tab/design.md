## Context

The shell has four fixed tabs. Schedule renders the authored link cards before its timeline. Tasks reads a separate `albumUrl` field and hides the seed placeholder. The provider validates identity only and passes each definition through unchanged. Build validation checks the fields that current views require.

See `proposal.md` for the reason to change this layout. The delta specs define the new behavior.

## Goals / Non-Goals

**Goals:**

- Keep the schedule visible first and provide a predictable home for crawl context.
- Use one validated link format for tickets, schedules, and group albums.
- Keep runtime rendering safe when the provider returns malformed optional content.

**Non-Goals:**

- Add rich text, Markdown, image uploads, or a coordinator editing screen.
- Change the map viewer, checklist scoring, or checklist storage.

## Decisions

### Keep the introduction in the crawl definition

Add optional `definition.intro` as a plain Unicode string. Build validation rejects blank or non-string values. The Info view renders it as text, preserving emoji. Runtime presentation treats malformed values as absent because the provider does not validate definition fields.

An HTML or Markdown field would add formatting and sanitization decisions that a short welcome does not need.

### Resolve Info visibility from usable content

The shell derives its navigation from an introduction string with non-whitespace text or the existing safe-link resolver's output. It appends Info after Tasks only when either is present. Schedule remains the opening tab. The navigation grid adapts to four or five columns. A 320 CSS pixel check verifies complete labels, 44 by 44 CSS pixel tap targets, and no horizontal overflow.

An always-present fifth tab would show an empty screen for a crawl without context or links. A header button would hide the content outside the established tab navigation.

### Move link presentation without changing link rules

An Info view owns the introduction and link cards. It reuses the existing link resolver and URL policy. Schedule owns only the timeline. The seed keeps its Ventra and Metra entries in their current order.

Moving the cards into Info is smaller than adding a second link collection. It also keeps authoring order and existing URL checks intact.

### Remove the special album field

Remove `albumUrl` from the definition type, build validator, seed YAML, and Tasks view. An organizer adds a real group album URL to `links[]` when one exists. Build validation rejects an authored `albumUrl` so an obsolete value cannot silently disappear.

Keeping a separate album field would preserve duplicate link paths and special placeholder handling. It would also conflict with the organizer's choice to treat the album like other links.

## Risks / Trade-offs

- [Five tabs can crowd a narrow phone] → Keep labels short, use equal-width cells, and verify the layout at 320 CSS pixels.
- [An authored link can be malformed at runtime] → Use the existing resolver for both Info visibility and rendered links.
- [A cached old YAML file can still contain `albumUrl`] → Ignore that obsolete field at runtime. Revalidate YAML on fresh requests and deploy the app with its seed data.
- [Moving the album adds a tab switch from Tasks] → Keep the scoring instructions in Tasks and show the album beside other links in Info.

## Migration Plan

Publish the updated shell and cory-trent YAML together. Keep Ventra and Metra links and add `intro: "Hello! and Welcome!"`. Remove the placeholder album field. Future organizers add a real album URL as an ordinary link.

The build fails if an authored record still contains `albumUrl`. Rollback restores the prior build and its matching YAML. Checklist state needs no migration.
