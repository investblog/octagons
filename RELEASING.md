# Releasing `octagons`

Releases publish from GitHub Actions (`.github/workflows/release.yml`) using npm
**Trusted Publishing (OIDC)** — no npm tokens are stored anywhere, and every release
carries a **provenance** attestation linking the published tarball to the exact repo,
commit, and workflow run. Same mechanism as `@spintax/core`.

## Trusted Publisher (configured)

npmjs.com → `octagons` → Settings → Trusted Publisher → **GitHub Actions**:
`investblog` / `octagons` / `release.yml`, environment blank. Configured and working since
0.2.0 — nothing to set up. If it is ever lost, restore exactly these values; the package
already exists, so no token is needed. The one-time token bootstrap that created the
package (0.1.x, no provenance) is retired and its workflow deleted — see
`docs/decisions/003-publishing-over-oidc.md`.

Requirements, per npm docs: trusted publishing needs npm ≥ 11.5.1 and Node ≥ 22.14.0
(the workflow upgrades npm and pins Node 22), and provenance requires a **public**
repository — private repos get no attestation even for public packages. This repo is
public.

## Cutting a release

```sh
# 1. Bump the version
npm version patch   # 0.1.0 -> 0.1.1
npm version minor   # 0.1.0 -> 0.2.0

# 2. Push the commit and the tag (npm version creates the tag)
git push origin main
git push origin vX.Y.Z
```

Pushing the `vX.Y.Z` tag triggers `release.yml`, which lints, builds, verifies the tag
matches `package.json`, checks the tarball actually contains both entry files, and
publishes with provenance. It can also be triggered manually from the Actions tab
(**workflow_dispatch**) after tagging.

The tag/version check exists because a tag can point at any commit — the job re-runs the
gates rather than trusting that main was green.

## Verifying a release

- The npm page shows a **"Provenance"** section with the source commit and build.
- `npm view octagons` reflects the new version.
- `npm audit signatures` (in a project that installed it) verifies the attestation.

## Notes

- Zero runtime dependencies. The tarball is the source file, the minified build, README
  and LICENSE — see `files` in `package.json`.
- **`octagons.min.js` is gitignored**, per the `git-discipline` rule against
  committing generated artifacts, so it exists only at publish time. `prepublishOnly`
  rebuilds it, and the workflow additionally asserts it is present in the tarball —
  without that check a broken build would ship a package missing its own minified entry.
- Version stays in `0.x` while the option surface settles; `set()` semantics may still
  move, and `1.0.0` would claim a stability that has not been earned.
