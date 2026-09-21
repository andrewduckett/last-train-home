# 0002. Strict CSP upheld by build-time script hashing

- Status: accepted
- Date: 2026-09-20
- Supersedes: none
- Superseded by: none

## Context

The site serves a strict Content Security Policy (CSP): `script-src 'self'` with no `'unsafe-inline'`. This is a deliberate security posture. It blocks any inline script the build did not authorize, which closes the most common cross-site-scripting path — an attacker injecting a `<script>` into the page. We want this posture to be a permanent property of the build, not a setting a later change can quietly relax.

The framework prerenders the app shell with a small inline bootstrap script that starts the client. A strict policy blocks exactly that inline script unless we authorize it. And because the site ships no server code, the policy must be decided at build time and travel inside the built files; there is no server to add a per-request token.

One further constraint: some CSP directives, such as `frame-ancestors`, are ignored inside an HTML `<meta>` tag and take effect only as an HTTP response header. So the policy cannot live in a single place.

## Decision

We authorize the framework's own inline scripts by content hash, computed at build time, and admit no other inline script. Today that is one bootstrap script, but the contract is the hash, not the count. The build tool hashes each inline script it emits and writes the hashes into the policy it puts in each prerendered page's `<meta>` CSP tag. Because a hash is derived from the script's exact bytes, an injected inline script has a different hash and does not run, and a framework upgrade regenerates the hashes automatically.

We place the `<meta>` tag in the document head before any script, so the policy is in force when scripts load. The posture has limits, stated plainly. It stops an injected inline script and any cross-origin script. It does not stop a same-origin script, since `script-src 'self'` allows those by design. It does not protect content that the browser parses before it reaches the `<meta>` tag, which is why the tag comes first.

We serve the header-only directive `frame-ancestors 'none'`, plus the non-CSP security headers (HSTS, `nosniff`, referrer policy), as HTTP response headers from the build's `_headers` file. We keep `script-src` out of that header. The browser enforces every delivered policy together and runs a script only if every policy authorizes it. A header that named `script-src 'self'` without the build hash would re-block the hashed bootstrap script. Splitting the two sources by directive lets them compose instead of collide. Two policies could also coexist if both carried the hash, but a hand-maintained header hash goes stale, so we do not rely on that.

We keep `'unsafe-inline'` for `style-src` only. The posture we protect is about scripts. Inline styles carry token-driven color and are not a script-execution vector.

We rejected three alternatives. A per-request nonce is impossible without a server. A single hand-maintained header carrying the script hash is brittle, because the hash changes every build and a stale value breaks the site. Relaxing the policy with `'unsafe-inline'` would defeat the posture.

## Consequences

- The no-unsafe-inline-scripts posture is provable on the built output, and a test asserts it, so a later change cannot reintroduce a blocked or unhashed inline script unnoticed.
- A framework or build upgrade that changes the bootstrap script needs no manual step: the hash regenerates from the new bytes.
- The policy is split across two places — the build config and the `_headers` file — so a reader must know both hold part of it. We accept that cost to avoid the two-policy conflict.
- Inline styles remain allowed, so the posture protects scripts specifically, not all inline content.
