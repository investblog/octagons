---
type: decision
status: active
tags: [release, security]
project: octagons
---

# 003 — Publish over OIDC, with a one-time token bootstrap

## Context

The sibling project `spintax-js` publishes `@spintax/core` with npm **Trusted Publishing
(OIDC)**: GitHub presents a signed identity, npm exchanges it for a short-lived publish
token, and the release carries a **provenance** attestation. No secret is stored anywhere.
That pattern was adopted here.

It has one gap. npm has no Settings page for a package that does not exist, so a trusted
publisher cannot be configured before the first publish — and the first publish therefore
needs a credential.

## Decision

- `release.yml` — tag-triggered, OIDC, provenance, no secret. The normal path.
- `bootstrap-publish.yml` — manual dispatch only, uses an `NPM_TOKEN` repository secret.
  Exists solely to create the package so trusted publishing can then be configured.

The credential lives in GitHub's encrypted secret store, not a plaintext `.npmrc` on a
workstation: write-only, scoped to one repository, and deletable the moment it is done.

## Status as of 0.1.2

**Trusted Publisher is still not configured.** Every release so far — 0.1.0, 0.1.1,
0.1.2 — went out through the bootstrap workflow, so:

- none of them carry provenance;
- each tag leaves a failed `release.yml` run behind;
- the `NPM_TOKEN` secret is still present, which is the thing this design existed to
  avoid.

## Remaining work

1. npmjs.com → `octagons` → Settings → Trusted Publisher → GitHub Actions →
   `investblog` / `octagons` / `release.yml` (filename only, not a path), Allowed
   actions: `npm publish`.
2. Settings → Publishing access → *Require two-factor authentication and disallow
   tokens*. This makes token publishing impossible, which also retires
   `bootstrap-publish.yml`.
3. Delete the `NPM_TOKEN` secret and revoke the token.
4. Delete `bootstrap-publish.yml`.

After that a release is `npm version patch && git push --follow-tags`, and nothing else.
