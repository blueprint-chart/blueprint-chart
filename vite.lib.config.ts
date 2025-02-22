import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/lib/runtime/index.ts',
      name: 'BlueprintChart',
      fileName: 'lib',
      formats: ['iife'],
    },
    outDir: 'dist/lib',
  },
})
