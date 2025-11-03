import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    types: 'src/types/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disable dts generation
  clean: true,
  outDir: 'lib',
  sourcemap: true,
  splitting: false,
  minify: false,
  treeshake: true,
  external: [],
})
