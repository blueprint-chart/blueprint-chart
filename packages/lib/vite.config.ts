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
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['d3', 'd3-blueprint', 'chroma-js', 'dayjs', '@floating-ui/dom'],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
    setupFiles: ['src/test-setup.ts'],
  },
})
