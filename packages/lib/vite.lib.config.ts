import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: {
        'lib': 'src/runtime/index.ts',
        'chart-css': 'src/runtime/chart-css.ts',
      },
      name: 'BlueprintChart',
      formats: ['iife'],
    },
    outDir: 'dist/lib',
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
})
