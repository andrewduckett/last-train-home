# 0004. Hand-edited YAML crawl records

- Status: accepted
- Date: 2026-09-21
- Supersedes: none
- Superseded by: none

## Context

Last Train Home renders **crawls**: timed outings with a schedule, venues, tasks, links, and a map. The app runs as static files without a backend. An organizer must be able to add an outing by editing data, then deploying the site.

The app already obtains each **crawl** through a **provider**. A **provider** is the boundary that retrieves a record and checks its **identity**. The screen knows the **crawl**'s stable **logical id**, but it does not know where the record lives. We must choose an authoring format and source without breaking that boundary.

## Decision

We store each authored **crawl** as one YAML file under the site's static crawl assets. A short **logical id** maps to that file only inside the **provider** implementation. The **provider** fetches the file at runtime and returns the same named outcomes as before. The screen continues to call getCrawl with a **logical id**.

The YAML record keeps title, optional date, and optional color at the top level. The requested **logical id** supplies the id. The **crawl** **definition** sits beneath a definition field and holds the schedule, venues, tasks, links, and map. This shape lets the **provider** carry authored content through unchanged. A future source can return the same record shape without changing the screen.

We chose YAML because organizers edit these records by hand and can use comments near event details. JSON would be easy to parse but would remove those comments. JavaScript modules would keep authoring tied to code. A remote API would add a backend before the release needs one. A flat YAML shape would be shorter, but the **provider** would have to split or reshape it.

## Consequences

- An organizer can add a **crawl** with one data file. The site still needs a build and deployment to publish it.
- The build validates every authored record against the fields that current views require.
- A direct link loads one **crawl** record after the app shell. This adds a same-origin request.
- Each record is a public static asset. The app does not provide a directory of records, but an id is not a secret.
- A missing file, a malformed file, and a failed request need separate results. The loader must recognize the app shell returned for a missing file.
- Stable YAML URLs require cache revalidation so redeployments replace stored event data.
- A later hosted source can replace the YAML implementation behind the **provider**. Existing route and screen code can keep using **logical ids**.
