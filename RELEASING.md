# Releasing

Releases are unified across the four packages (`lib`, `ui`, `editor`, `docs`) — one tag, one set of versions, one Release.

## Steps

1. From a clean `main` working tree, pick one:

   ```bash
   make release-patch       # 0.1.0 → 0.1.1
   make release-minor       # 0.1.0 → 0.2.0
   make release-major       # 0.1.0 → 1.0.0
   make release VERSION=0.4.2   # explicit
   ```

   This bumps all four packages, creates the commit `chore(release): vX.Y.Z`, and tags `vX.Y.Z` locally.

2. Push:

   ```bash
   git push --follow-tags
   ```

3. On GitHub, create a Release for `vX.Y.Z`. Author the release notes. Publish.

4. The `Release` workflow runs automatically:
   - `verify` confirms the four `package.json` versions match the tag
   - `ci` runs lint + test + build
   - `publish-npm` publishes all four packages with provenance
   - `deploy-pages` pushes `packages/editor/dist/` to `blueprint-chart/blueprintchart.com`, writing a runtime `config.json` from the `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` secrets so the deployed editor has accounts enabled
   - `deploy-docs` pushes the VitePress build to `blueprint-chart/docs.blueprintchart.com`

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

Before a real release, dry-run the workflow:

GitHub → Actions → Release → Run workflow → leave `dry_run` checked, optionally specify a tag (defaults to current `lib` version).

This validates the pack contents and the Pages-repo diff without publishing or pushing.

## Recovering from a failed release

| Failure | Recovery |
|---|---|
| `make release-*` aborted between version bump and commit (rare) | `git checkout packages/*/package.json` to discard partial bumps, then retry |
| `verify` job fails | Edit drifted `package.json`, delete the tag locally and on GitHub, delete the Release, re-tag, re-create Release |
| `ci` job fails | Fix on `main`, delete the failed Release + tag, cut a fresh patch release |
| `publish-npm` partial (some packages live, others not) | NPM rejects republishing the same version. Bump to the next patch and re-release the lot |
| `deploy-pages` failed | Re-run only the `deploy-pages` job from the GitHub UI (idempotent — it wipes and replaces) |
| `deploy-docs` failed | Re-run only the `deploy-docs` job from the GitHub UI (idempotent — it wipes and replaces) |
| Bad release shipped | `npm deprecate @blueprint-chart/<name>@x.y.z "reason"` and ship a fix in the next version |
