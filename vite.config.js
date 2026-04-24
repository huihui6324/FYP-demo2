import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Root-cause fix:
  // - Dev server should use "/" so Cesium worker/module URLs resolve correctly.
  // - Production (GitHub Pages) still uses repository subpath.
  base: command === 'serve' ? '/' : '/FYP-demo2/',
  plugins: [react(), cesium()],
}))
