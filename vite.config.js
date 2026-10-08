import { defineConfig } from 'vite';

// base './' lets the built site work under any GitHub Pages sub-path.
export default defineConfig({
  base: './DSWD-NewGRS/',
  build: { outDir: 'dist' },
});
