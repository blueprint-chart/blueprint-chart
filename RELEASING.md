# Releasing

Releases are unified across the four packages (`lib`, `ui`, `editor`, `docs`) — one tag, one set of versions, one Release.

## How releases happen

Releases are automatic. Push Conventional Commits to `main`:

- `fix:` → patch · `feat:` → minor · `feat!:` / `BREAKING CHANGE:` → major
- `docs:` / `style:` / `chore:` / `test:` / `refactor:` / `ci:` → no release

When the `CI` workflow succeeds on `main`, the `Release` workflow runs semantic-release, which:

1. Computes the next version from the commits since the last `vX.Y.Z` tag.
2. Bumps all four packages to that version and re-checks them with `verify-release-versions.mjs`.
3. Writes `CHANGELOG.md` and creates the GitHub Release with generated notes (editable afterward).
4. Publishes all four packages to npm with provenance.
5. Tags `vX.Y.Z` and commits `chore(release): vX.Y.Z [skip ci]` back to `main`.
6. Deploys the editor to blueprintchart.com and the docs to docs.blueprintchart.com (only when a release is cut).

You do not run anything locally and you do not touch the GitHub UI.

> **Docs-only changes** do not cut a release, so they will not redeploy the docs site until the
> next `feat`/`fix`. To force a deploy, trigger **Actions → Release → Run workflow** with
> `dry_run` unchecked (it will redeploy the current build if a release is computed), or land a
> `fix:` commit.

## DSL grammar changes

Any release that touches `packages/lib/src/dsl/grammar.peggy` must call the change out under a **DSL** heading in `CHANGELOG.md`. The DSL is a public contract: readers rely on the CHANGELOG to learn that keyword spellings, the data meta-row, number or string lexing, or comment handling shifted. Mark removals and renames as **BREAKING** so the impact is unambiguous.

## Editor Supabase config

The editor reads its Supabase credentials from a runtime `config.json` deployed
next to `index.html`, not from the build. `deploy-pages` generates that file from
two repository secrets (`Settings → Secrets and variables → Actions`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Keeping them out of the build means the npm-published `@blueprint-chart/editor`
package stays credential-free — only the deployed site is configured. If either
secret is missing the editor still ships fine, with accounts disabled. The anon
key is safe to expose (RLS-protected) but will live in the public Pages repo's
git history. Confirm `https://blueprintchart.com` is in the Supabase Email
provider's allowed redirect URLs, or magic-link sign-in will fail.

## Dry run

GitHub → Actions → Release → **Run workflow** → leave `dry_run` checked.

semantic-release runs in dry-run: it prints the next version it *would* release and the generated
notes, and validates the pack, without publishing, tagging, committing, or deploying.

## Recovering from a failed release

| Failure | Recovery |
|---|---|
| `make build` / publish failed mid-run | Fix forward with a `fix:` commit — semantic-release never reuses a version; the next green CI republishes cleanly |
| `verify-release-versions.mjs` (inside exec) fails | A package drifted; fix the version on `main` and push a `fix:` |
| `deploy-pages` / `deploy-docs` failed | Re-run only that job from the GitHub UI (idempotent — it wipes and replaces) |
| Bad release shipped | `npm deprecate @blueprint-chart/<name>@x.y.z "reason"` and ship a `fix:` |
| Need a release the commits won't trigger | Land an explicit `fix:`/`feat:`, or use **Actions → Release → Run workflow** with `dry_run` off |
| Emergency manual release | `make release-*` + `git push --follow-tags` still work as a fallback (see Makefile) |
