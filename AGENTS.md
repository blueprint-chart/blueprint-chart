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

### Stack & conventions

- Vue 3 + Composition API + `<script setup lang="ts">` everywhere.
- SFC section order: `<script>` → `<template>` → `<style>`.
- Use PascalCase for component names in templates and filenames.
- Use BootstrapVueNext components and Bootstrap CSS variables wherever possible.
- Components live in hierarchical directories (e.g., `Editor/EditorPanel.vue`).
- Design is mobile-first and must support both light and dark mode.
- Auto-imports are configured for BootstrapVueNext and Phosphor icons (prefix: `icon-ph-*`).
- Use `ButtonIcon` instead of raw `BButton` throughout `@blueprint-chart/ui` and `@blueprint-chart/editor`.
- Container components (e.g., `FormControlButtonGroup`, `FormControlDropdown`, `FormControlPalette`, `NavigationIconRail`, `NavigationStepper`) support both an array prop and a slot-based child entry API via provide/inject (`useChildEntriesProvider` / `useChildEntry`). Slot children take precedence over the array prop.

### Component splitting

Keep components small and focused — each component should have **one clear responsibility**. Split when **any** of these is true:

- The component owns both orchestration/state and substantial presentational markup for multiple sections.
- It has 3+ distinct UI sections (e.g., form, list, footer).
- A template block is repeated or could become reusable (item rows, cards).

Entry/root and route-view components must stay thin — app shell, layout, provider wiring, and feature composition only. Do not place full feature implementations in them.

### Data flow

- **Props down, events up** — the primary communication model.
- Use `defineModel` for two-way bound props.
- Emit events instead of mutating parent state directly.
- Prefer props/emits over component refs; use refs only for imperative APIs (`defineExpose`).
- Use provide/inject only for deep-tree dependencies (3+ layers); keep mutations in the provider and expose explicit actions.
- Type component boundaries with `defineProps<T>`, `defineEmits<T>`, and `InjectionKey`.

### Reactivity

- Use `shallowRef()` instead of `ref()` for primitive values (string, number, boolean).
- Use `ref()` when you often replace the entire value and need deep reactivity.
- Use `reactive()` when you mainly mutate properties in place.
- Derive everything possible with `computed` — keep `computed` getters pure (no side effects).
- Use watchers only for side effects; prefer `immediate: true` over duplicate `onMounted` calls.
- Never put `.filter()` / `.sort()` / method calls in templates — use a `computed` instead.

### Template rules

- Use `useTemplateRef<T>('name')` instead of `ref<T | null>(null)` for template refs.
- Dynamic `:class` bindings must use a computed property (or a function when inside `v-for`) — never inline class objects in the template.
- Always provide a stable primitive `:key` on `v-for`.
- Never use `v-if` and `v-for` on the same element — filter with a `computed` or wrap with a container element.
- Choose `v-if` vs `v-show` by toggle frequency: `v-show` for frequent toggles, `v-if` for rare conditions.

## Composables

- Extract logic into composables (`useXxx()`) when it is reused, stateful, or side-effect heavy.
- Compose complex behavior from small, focused composables — not one monolith.
- Use an options-object parameter when a composable has multiple optional settings.
- Return `readonly()` state with explicit action functions when consumers should not mutate directly.
- Keep pure utility functions (formatters, parsers) as plain functions in `utils/`, not composables.

## Icons

- Use regular-weight Phosphor icons (`~icons/ph/star`, auto-imported as `<IconPhStar />`).
- Duotone icons (`~icons/ph/star-duotone`) are reserved exclusively for `NavigationIconRail`.

## Styling

- Bootstrap and Bootstrap CSS variables take priority for all styling.
- Custom styles go in `packages/editor/src/assets/styles/main.scss`.
- Use SCSS only when Bootstrap utilities are insufficient.
- Use `@use` (modern Sass) instead of `@import`.

## BEM

- Every component's root element gets a **block** class matching the component name in kebab-case (e.g., `DataUploadCard` → `.data-upload-card`).
- **Element** classes must reflect the full DOM parent chain from the block, not just the leaf name. Use double-underscore (`__`) segments for each nesting level:
  - `.data-upload-card__header` — direct child of block
  - `.data-upload-card__header__title` — child of header
  - `.data-upload-card__header__title__icon` — child of title
  - **Wrong:** `.data-upload-card__icon` when the icon is nested inside header → title.
- **Modifiers** use double-hyphen (`--`) on the element they modify (e.g., `.data-upload-card__header--active`).
- Nest BEM selectors in SCSS to mirror the DOM hierarchy:
  ```scss
  .data-upload-card {
    &__header {
      &__title {
        &__icon { … }
      }
      &--active { … }
    }
  }
  ```
- Never use bare tag selectors (e.g., `p`, `span`) inside a BEM block — always add a BEM element class.
- Keep blocks small. If a subtree grows complex, extract it into its own component (and therefore its own BEM block) rather than accumulating deeply nested element chains.

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
