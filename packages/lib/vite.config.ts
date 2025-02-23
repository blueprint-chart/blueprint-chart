import { defineConfig } from 'vite'

export default defineConfig({
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
  },
})
