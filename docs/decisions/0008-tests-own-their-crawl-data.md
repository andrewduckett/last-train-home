# 0008. Tests own their crawl data

- Status: proposed
- Date: 2026-09-26
- Supersedes: none
- Superseded by: none

## Context

Last Train Home renders **crawls**: themed, multi-stop outings with a schedule, places, a checklist of tasks, and links. Each crawl is a YAML file that an organizer edits by hand. The app ships the files as static assets. The product promise is that a new or changed outing needs only a data edit, not a code change.

The test suite used the first live crawl as its test data. Tests read that crawl's file, kept a hand-copied mirror of it, and asserted its exact title, links, and station names. So each routine content edit broke the suite, and the author had to follow up with a "sync the fixture" commit. The promise held for the app but not for the repository.

Two forces pull against each other. Tests need realistic data to exercise every rendering branch. Authors need to change live content freely, for example days before an event.

## Decision

Tests own their crawl data. Behavior tests build made-up crawls from small builder functions in the test tree. Each builder returns valid, invented values, and a test overrides only the fields it asserts on. No test copies content from an authored crawl.

Authored crawls get a contract check only. One test finds every authored file and checks that it passes build validation and that the provider resolves it by its id. It never compares an authored title, text, link, place, task, or color with an expected value. A guard test fails when any other test reads the authored crawl directory. The guard does not ban authored ids: a crawl added later could share a name with an id a test invents, and adding it would then break the suite.

We rejected three alternatives:

- **Keep the snapshots and update them with each edit.** That keeps the cost this decision removes.
- **Commit synthetic YAML fixture files.** They are one more fixed dataset. Tests would couple to those files the same way, and the data would sit far from the assertions that use it.
- **Generate random crawls on each run.** Random data finds edge cases, but it adds a dependency and makes failures harder to read. The suite needs clear, repeatable inputs more than coverage of odd shapes.

## Consequences

- An author can edit or add a valid crawl without touching a test. An invalid crawl still fails the build and the contract test, with a message that names the file. The build test checks only that each crawl was published, so a content edit does not fail against an older build.
- Each test shows the data it depends on next to its assertions. A schema change needs a fix in the builders, not in every test.
- The suite no longer proves that a live crawl still says what it said before. If an outing's exact content ever needs protection, that check belongs in authoring review, not in the test suite.
- A contributor who wants "a real crawl" in a test must use a builder instead. The guard test's failure message says so.
