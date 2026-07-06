import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      entryRoot: 'src',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/test-setup.ts'],
      insertTypesEntry: true,
      rollupTypes: false,
    }),
  ],
  build: {
    lib: {
      // `index` is the full public API. `embed` is a narrow entry exposing only
      // the srcdoc builder + message contract (so hosts building an embed iframe
      // don't pull the chart engine). `runtime` is the ESM form of the embed
      // runtime (initBlueprint / scene controllers) for module-form consumers.
      entry: {
        index: 'src/index.ts',
        embed: 'src/embed.ts',
        runtime: 'src/runtime/index.ts',
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        'd3', 'd3-blueprint', 'd3-transition', 'chroma-js', 'dayjs', '@floating-ui/dom',
        '@blueprint-chart/lib/internal/node-backend',
        'jsdom', '@napi-rs/canvas', '@resvg/resvg-js',
      ],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
    setupFiles: ['src/test-setup.ts'],
    // The unified render() front door reaches the Node backend via the
    // conditional subpath export `@blueprint-chart/lib/internal/node-backend`,
    // which resolves to `dist/node-backend/` only after a build. Under vitest we
    // run against source, so alias the subpath to the backend's source module —
    // otherwise tests would depend on a prior `pnpm build` to resolve the import.
    alias: {
      '@blueprint-chart/lib/internal/node-backend': new URL('./src/render/backends/node-backend.ts', import.meta.url).pathname,
    },
  },
})
