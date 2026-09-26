# Deployment Specification

## Purpose

Deployment defines how the site builds and serves. It is static-first with no server code. It enforces a strict Content Security Policy: every script, style, font, and image the app loads is same-origin. Once the page's policy is in force, a script runs only when it is same-origin or matches a hash the build authorized.

## Requirements

### Requirement: Static-only build

The build SHALL produce static assets only, with no server code or server functions. The site SHALL run behind a host that serves files.

#### Scenario: Build emits static assets

- **WHEN** the production build runs
- **THEN** it emits a static asset directory with no server entry point

### Requirement: SPA fallback for unmatched paths

The build SHALL emit a single-page-application fallback shell as `index.html`. The host SHALL serve that shell with HTTP 200 for any path that matches no static asset. A present asset SHALL take priority over the fallback.

#### Scenario: Unmatched path serves the app shell

- **WHEN** a browser requests a path with no matching static asset
- **THEN** the host serves the fallback `index.html` with HTTP 200 rather than a 404

#### Scenario: A real asset is served directly

- **WHEN** a browser requests a path that matches a static asset
- **THEN** the host serves that asset rather than the fallback shell

### Requirement: Content Security Policy authorizes scripts by origin or build hash

The served Content Security Policy SHALL set `script-src` to `'self'` plus the build's own script hashes, and SHALL NOT include `'unsafe-inline'` in `script-src`. Every inline script in the shipped HTML SHALL be authorized by one of those hashes. The build SHALL emit the policy so that it applies to the shipped `index.html` fallback shell.

#### Scenario: script-src excludes unsafe-inline

- **WHEN** the served Content Security Policy is inspected
- **THEN** its `script-src` lists `'self'` and any build hashes, and does not contain `'unsafe-inline'`

#### Scenario: Every inline script is hash-authorized

- **WHEN** the shipped `index.html` is inspected against the served policy
- **THEN** every inline `<script>` matches a hash in `script-src`, and no inline script is unauthorized

#### Scenario: An unauthorized inline script is blocked

- **WHEN** an inline script whose hash is not in the policy appears after the policy's `<meta>` tag
- **THEN** the policy blocks that script from running

### Requirement: Same-origin assets, self-hosted fonts, and no frames

Every script, style, font, and image the app document loads SHALL be same-origin. Fonts SHALL be self-hosted and bundled at build time. The served Content Security Policy SHALL set `frame-src` to `'none'`, so the app document loads no frames from any origin, its own included.

#### Scenario: The app document loads only same-origin assets

- **WHEN** the built site loads its shell
- **THEN** the scripts, styles, fonts, and images the document itself requests come only from its own origin


#### Scenario: The policy allows no frames

- **WHEN** the served Content Security Policy is inspected
- **THEN** its `frame-src` directive is exactly `'none'`

#### Scenario: The policy names no map provider

- **WHEN** the served Content Security Policy is inspected
- **THEN** it lists no `https://www.google.com` source in any directive

### Requirement: Baseline security headers via HTTP response

The host SHALL serve `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, a `Referrer-Policy`, and `frame-ancestors 'none'` as HTTP response headers, since a `<meta>` tag cannot express them. The header source file SHALL sit in the build's static input so the build emits it into the served asset directory.

#### Scenario: Security headers reach the response

- **WHEN** the served response headers for the shell are inspected
- **THEN** they include HSTS, `nosniff`, a referrer policy, and `frame-ancestors 'none'`

#### Scenario: The headers file ships in the build output

- **WHEN** the production build completes
- **THEN** the emitted asset directory contains the `_headers` file

### Requirement: Revalidate crawl records after deployment

The host SHALL require caches to revalidate YAML crawl records before reuse. The policy SHALL apply to stable URLs under the crawl asset path.

#### Scenario: An organizer redeploys an updated crawl

- **WHEN** a participant requests the same YAML crawl URL after a deployment
- **THEN** browser and edge caches revalidate the record before serving it

#### Scenario: Built assets keep their existing cache behavior

- **WHEN** the host serves scripts, styles, fonts, or images outside the crawl asset path
- **THEN** the YAML revalidation policy does not change their cache behavior
