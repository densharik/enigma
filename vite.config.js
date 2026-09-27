import { defineConfig } from 'vite'

// relative paths: the site works from any folder, e.g. https://densharik.github.io/enigma/
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 800 },
})
