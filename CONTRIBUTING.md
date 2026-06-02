# Contributing to Blueprint Chart

Thanks for your interest in Blueprint Chart. This guide covers how to set up the project, the workflow we follow, and what we look for in a contribution.

By participating you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Ways to contribute

- **Report a bug** — open an [issue](https://github.com/blueprint-chart/blueprint-chart/issues) using the bug template. A minimal `.bpc` source that reproduces the problem is worth a thousand words.
- **Request a feature or chart type** — open an issue using the feature template and describe the journalism / data story you're trying to tell.
- **Improve docs** — the handbook, guides, and DSL spec live in `packages/docs`.
- **Send a pull request** — see the workflow below.

For large or architectural changes, please open an issue to discuss the approach before writing code.

## Project layout

Blueprint Chart is a [pnpm](https://pnpm.io) workspace of four packages (plus the separate [`@blueprint-chart/mcp`](https://github.com/blueprint-chart/mcp) repo):

| Package | Role |
| --- | --- |
| `@blueprint-chart/lib` | Pure TypeScript + D3 chart engine and the Peggy `.bpc` DSL parser. No Vue. |
| `@blueprint-chart/ui` | Vue 3 component library (forms, panels, navigation, scene timeline). |
| `@blueprint-chart/editor` | Vue 3 SPA composing `lib` + `ui` into the authoring experience. |
| `@blueprint-chart/docs` | VitePress site: handbook, guides, DSL spec, API reference. |

`ui` does **not** depend on `lib`; only the editor composes both.

## Prerequisites

- **Node 22** and **pnpm 10**.
- The [Makefile](./Makefile) at the repo root is the canonical entry point for every task. Prefer `make <target>` over raw `pnpm` calls so local runs match CI.

## Getting started

```bash
make install      # install all workspace dependencies
make dev          # start the editor dev server (http://localhost:5555)
make dev-story    # Histoire — UI component stories
make dev-docs     # VitePress docs site
```

Run `make help` to see every available target.

## Before you open a pull request

Run the same checks CI runs:

```bash
make lint         # ESLint across all packages
make test         # all unit tests (Vitest + Vue Test Utils)
make test-e2e     # Playwright end-to-end smoke tests
```

All four CI jobs call the Makefile, so a green local `make lint && make test && make test-e2e` is the best predictor of a green PR.

### Tests are not optional

- Unit and component tests live **next to the code they cover** (`foo.ts` → `foo.test.ts`), using Vitest + jsdom + Vue Test Utils.
- Component behaviour is also documented as Histoire stories in `packages/ui`.
- End-to-end flows live in `e2e/` (Playwright / Chromium).
- New behaviour needs a test. Bug fixes need a regression test. We'd rather have too many tests than too few.

## Coding style

The authoritative coding guidelines live in [`AGENTS.md`](./AGENTS.md). In short:

- Vue 3 + Composition API + `<script setup lang="ts">` throughout.
- Strict BEM for SCSS (element classes reflect the full DOM parent chain).
- TypeScript everywhere; keep composables and stores small, typed, and focused.
- `make lint` enforces the mechanical rules — run it before pushing.

## Commit & PR conventions

- Commits are **small, semantic, and one-line** (inspired by Conventional Commits, e.g. `feat(editor): add percent value labels`). No commit body, no co-author trailers — see [`AGENTS.md`](./AGENTS.md).
- Keep a PR focused on one logical change. Smaller PRs get reviewed faster.
- Fill in the pull-request template: what changed, why, and how you verified it.
- Reference the issue your PR addresses (`Closes #123`).

## License

By contributing, you agree that your contributions are licensed under the project's [MIT License](./LICENSE).
