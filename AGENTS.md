# Blueprint Chart — Coding Guidelines

## General

- TypeScript everywhere, strict mode.
- Small, iterative, semantic commits — no co-author or body.
- Makefile targets are the canonical way to run operations (dev, CI, etc.).
- Code quality and readability are central — keep functions, components, composables, and chart modules small.

## Project Structure

- `src/lib/dsl/` — DSL lexer, parser, serializer, types
- `src/lib/charts/` — D3-based chart rendering (frame, canvas, axis, chart types, legend, registry)
- `src/lib/runtime/` — embeddable runtime for `<script type="application/blueprint-chart">`
- `src/components/` — Vue UI components (hierarchical: `Component/ComponentName.vue`)
- `src/composables/` — Vue composables (`useChartConfig`, `useChartPreview`, etc.)
- `src/assets/styles/` — SCSS, Bootstrap imports, CSS variables

## Vue & Components

- Use BootstrapVueNext components and Bootstrap CSS variables wherever possible.
- Components live in hierarchical directories (e.g., `Editor/EditorPanel.vue`).
- Components should be as small as possible — prefer composition over large monoliths.
- Design is mobile-first and must support both light and dark mode.
- Auto-imports are configured for BootstrapVueNext and Phosphor icons (prefix: `icon-ph-*`).

## Styling

- Bootstrap and Bootstrap CSS variables take priority for all styling.
- Custom styles go in `src/assets/styles/main.scss`.
- Use SCSS only when Bootstrap utilities are insufficient.

## Testing

- Use Vitest with jsdom environment.
- Test files live next to the source file they test (`foo.ts` → `foo.test.ts`).
- Aim for maximum test coverage on DSL parser, charts, and components.

## Linting

- ESLint flat config with Vue plugin, TypeScript-ESLint, and Stylistic.
- Run `make lint` before committing; CI will enforce it.

## Charts

- Each chart type lives in its own directory under `src/lib/charts/types/`.
- Chart types export a render function: `(canvas: SVGElement, data, options) => void`.
- The registry maps chart type names to render functions.
