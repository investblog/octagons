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

## Status as of 0.2.1

**Trusted Publishing works.** 0.2.0 and 0.2.1 were published by `release.yml` on the tag
push, over OIDC, with a provenance attestation (SLSA v1) — no secret involved.
`bootstrap-publish.yml` has been deleted. Steps 1 and 4 below are done; what remains is the
maintainer's, on npmjs.com and in the repository settings: delete the unused `NPM_TOKEN`
secret, revoke the token, and optionally disallow token publishing (steps 2–3).

## Remaining work (as written at 0.1.2)

1. npmjs.com → `octagons` → Settings → Trusted Publisher → GitHub Actions →
   `investblog` / `octagons` / `release.yml` (filename only, not a path), Allowed
   actions: `npm publish`.
2. Settings → Publishing access → *Require two-factor authentication and disallow
   tokens*. This makes token publishing impossible, which also retires
   `bootstrap-publish.yml`.
3. Delete the `NPM_TOKEN` secret and revoke the token.
4. Delete `bootstrap-publish.yml`.

After that a release is `npm version patch && git push --follow-tags`, and nothing else.
