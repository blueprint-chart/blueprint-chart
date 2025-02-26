# Blueprint Chart — Coding Guidelines

## General

- TypeScript everywhere, strict mode.
- Small, iterative, semantic commits — no co-author or body.
- Makefile targets are the canonical way to run operations (dev, CI, etc.).
- Code quality and readability are central — keep functions, components, composables, and chart modules small.

## Project Structure (PNPM Monorepo)

Three workspace packages under `packages/`:

### `@blueprint-chart/lib` (`packages/lib/`)

Pure TypeScript charting library — no Vue dependency.

- `src/charts/` — D3-based chart rendering (frame, canvas, axis, chart types, legend, registry)
- `src/dsl/` — DSL lexer, parser, serializer, types
- `src/runtime/` — embeddable runtime for `<script type="application/blueprint-chart">`
- `src/samples.ts` — sample chart definitions
- `src/index.ts` — barrel export for all public API

### `@blueprint-chart/ui` (`packages/ui/`)

Shared Vue component library used by the editor.

- `src/components/` — hierarchical component directories (App, Button, Display, Form, Layout, List, Navigation, Section, Feedback)
- `src/composables/` — shared composables (`useChildEntries`, injection keys)
- `src/styles/` — SCSS variables and mixins
- `src/types.ts` — shared types (e.g., `IconSize`)
- `src/index.ts` — named exports for all components, composables, and types

### `@blueprint-chart/editor` (`packages/editor/`)

Vue 3 + Vite application — the chart editor UI.

- `src/components/` — Vue UI components (hierarchical: `Component/ComponentName.vue`)
- `src/composables/` — Vue composables (`useChartConfig`, `useChartPreview`, etc.)
- `src/assets/styles/` — SCSS, Bootstrap imports, CSS variables
- `src/main.ts`, `src/App.vue`, `src/router.ts` — app entry

### Workspace Root

- `pnpm-workspace.yaml` — workspace definition
- `tsconfig.base.json` — shared TypeScript compiler options
- `tsconfig.json` — project references only
- `eslint.config.js` — shared ESLint config

## Dependencies Between Packages

- `lib` has no workspace dependencies (pure TS + D3)
- `ui` depends on Vue + Bootstrap (no workspace deps)
- `editor` depends on `workspace:lib` and `workspace:ui`

## Imports

- Inside `editor`, use `@blueprint-chart/lib` for chart/DSL/sample imports
- Inside `editor`, use `@blueprint-chart/ui` for form component imports (named: `import { FormSelect } from '@blueprint-chart/ui'`)
- Inside `editor`, use `@/` alias for editor-internal imports (maps to `packages/editor/src/`)
- Inside `lib`, use relative imports only — no path aliases

## Vue & Components

- Use BootstrapVueNext components and Bootstrap CSS variables wherever possible.
- Components live in hierarchical directories (e.g., `Editor/EditorPanel.vue`).
- Components should be as small as possible — prefer composition over large monoliths.
- Design is mobile-first and must support both light and dark mode.
- Auto-imports are configured for BootstrapVueNext and Phosphor icons (prefix: `icon-ph-*`).
- Use `ButtonIcon` instead of raw `BButton` throughout `@blueprint-chart/ui` and `@blueprint-chart/editor`.
- Use `defineModel` for two-way bound props.
- Use `useTemplateRef<T>('name')` instead of `ref<T | null>(null)` for template refs.
- Dynamic `:class` bindings must use a computed property (or a function when inside `v-for`) — never inline class objects in the template.
- Container components (e.g., `FormControlButtonGroup`, `FormControlDropdown`, `FormControlPalette`, `NavigationIconRail`, `NavigationStepper`) support both an array prop and a slot-based child entry API via provide/inject (`useChildEntriesProvider` / `useChildEntry`). Slot children take precedence over the array prop.

## Icons

- Use regular-weight Phosphor icons (`~icons/ph/star`, auto-imported as `<IconPhStar />`).
- Duotone icons (`~icons/ph/star-duotone`) are reserved exclusively for `NavigationIconRail`.

## Styling

- Bootstrap and Bootstrap CSS variables take priority for all styling.
- Custom styles go in `packages/editor/src/assets/styles/main.scss`.
- Use SCSS only when Bootstrap utilities are insufficient.
- Use `@use` (modern Sass) instead of `@import`.

## Testing

- Use Vitest with jsdom environment.
- Test files live next to the source file they test (`foo.ts` → `foo.test.ts`).
- Lib tests run in `packages/lib/`, editor tests run in `packages/editor/`.
- `make test` runs all tests; `make test-lib` / `make test-editor` for individual packages.

## Linting

- ESLint flat config with Vue plugin, TypeScript-ESLint, and Stylistic.
- Single config at the workspace root covers all packages.
- Run `make lint` before committing; CI will enforce it.

## Charts

- Each chart type lives in its own directory under `packages/lib/src/charts/types/`.
- Chart types export a render function: `(canvas: SVGElement, data, options) => void`.
- The registry maps chart type names to render functions.
