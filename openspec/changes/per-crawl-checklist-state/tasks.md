## 1. Device storage boundary

- [ ] 1.1 Write failing tests for per-crawl keys, empty `ok` records, literal `true` own values, inherited properties, and old-key exclusion; confirm the focused tests fail.
- [ ] 1.2 Write failing tests for unavailable reads, non-throwing storage errors, and `saveChecks` returning `true` or `false`; confirm the focused tests fail.
- [ ] 1.3 Add the state-store interface and localStorage adapter; confirm the focused storage tests pass.

## 2. Checklist controller

- [ ] 2.1 Write failing controller tests for toggles, reset, and prototype-shaped ids; confirm the focused test fails.
- [ ] 2.2 Write a test that excludes a removed task id from exposed checks and later saves; confirm it fails after editing a current task.
- [ ] 2.3 Write tests for clean refresh, failed-read retention, failed-write retention, dirty-state precedence, and clearing that state after a successful save; confirm they fail.
- [ ] 2.4 Replace the global singleton with a controller factory; confirm all focused controller tests pass.

## 3. Shell and Tasks view

- [ ] 3.1 Update shell tests to ignore `crawl-checks-v1`; add failing reload and per-crawl persistence tests; confirm they fail before shell and view edits.
- [ ] 3.2 Write failing component tests for shared task ids across crawls, root and id routes sharing one crawl, and newer saved checks on Tasks entry; confirm the focused tests fail.
- [ ] 3.3 Write failing component tests for unreadable or malformed storage on shell startup and removed ids not affecting the tally; confirm the focused tests fail.
- [ ] 3.4 Write failing component tests for a failed write across tab changes and Reset after a failed write; confirm the focused tests fail.
- [ ] 3.5 Let the shell own one controller per crawl and pass it to the Tasks view; confirm the focused tests and existing tally and Reset tests pass.

## 4. Integration verification

- [ ] 4.1 Run `npm test`, `npm run check`, and `npm run build`; confirm all three commands pass on the finished implementation.
