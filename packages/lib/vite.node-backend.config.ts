import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { cpSync } from 'node:fs'

// Builds the Node-only backend as a separate, self-contained ESM chunk so the
// main bundle (dist/index.js) never statically references jsdom/resvg/canvas.
// The main bundle reaches this chunk via the conditional `./internal/node-backend`
// export, dynamically imported at runtime.
export default defineConfig({
  build: {
    outDir: 'dist/node-backend',
    emptyOutDir: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/render/backends/node-backend.ts'),
        browser: resolve(__dirname, 'src/render/backends/node-backend.browser.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      // Node deps stay external (resolved at runtime in Node); the main lib is
      // imported as a bare specifier and stays external too.
      external: [
        'jsdom', '@napi-rs/canvas', '@resvg/resvg-js',
        'd3', 'd3-blueprint', 'd3-transition', 'chroma-js', 'dayjs', '@floating-ui/dom',
        /^@blueprint-chart\/lib/,
      ],
    },
  },
  plugins: [
    {
      // Copy bundled fonts next to the built chunk so import.meta.url-relative
      // 'fonts' resolution works in dist (mirrors mcp's tsc copy step).
      name: 'copy-fonts',
      closeBundle() {
        cpSync(
          resolve(__dirname, 'src/render/backends/fonts'),
          resolve(__dirname, 'dist/node-backend/fonts'),
          { recursive: true },
        )
      },
    },
  ],
})
