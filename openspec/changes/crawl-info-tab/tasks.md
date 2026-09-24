## 1. Authoring contract

- [ ] 1.1 Add failing tests for omitted, Unicode, blank, and malformed introductions and the obsolete `albumUrl` field. Update the definition type and build validator; verify the focused validation tests pass.
- [ ] 1.2 Set cory-trent's intro to exactly "Hello! and Welcome!", keep Ventra and Metra in order, and remove the album placeholder. Verify `npm run validate:crawls` and seed-content tests pass.

## 2. Info experience

- [ ] 2.1 Add failing view tests for plain text, emoji, safe links, authored order, and malformed runtime content. Build the Info view using the existing link resolver; verify its focused tests pass.
- [ ] 2.2 Add failing navigation tests for intro-only, links-only, empty, blank, and malformed content. Show Info only for usable content, move quick-link cards off Schedule, and verify the shell and Schedule tests pass.
- [ ] 2.3 Add a failing test for opening a crawl without Info while Info is active. Reset the new crawl to Schedule and verify the route and shell tests pass.
- [ ] 2.4 Add a failing test that Tasks has no special album button. Remove album handling from Tasks and update integration expectations; verify the Tasks and shell tests pass.

## 3. Phone and build verification

- [ ] 3.1 Check the five-tab shell at a 320 CSS pixel viewport. Verify full labels, tap targets of at least 44 by 44 CSS pixels, and no horizontal overflow; fix any layout failure.
- [ ] 3.2 Run `npm test`, `npm run check`, `npm run build`, and `openspec validate crawl-info-tab --strict`. Verify all pass and the built site keeps its strict script CSP.
