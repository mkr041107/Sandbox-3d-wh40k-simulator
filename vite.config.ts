import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages project site: https://mkr041107.github.io/Sandbox-3d-wh40k-simulator/
  base: '/Sandbox-3d-wh40k-simulator/',
  plugins: [react()],
})
