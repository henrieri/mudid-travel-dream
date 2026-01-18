import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { execSync } from 'child_process'

// Get git info at build time
function getGitInfo() {
  try {
    const commit = execSync('git rev-parse --short HEAD').toString().trim()
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
    const dirty = execSync('git status --porcelain').toString().trim() ? '-dirty' : ''
    return { commit: commit + dirty, branch }
  } catch {
    return { commit: 'unknown', branch: 'unknown' }
  }
}

const gitInfo = getGitInfo()
const buildTime = new Date().toISOString()

const config = defineConfig({
  plugins: [
    // devtools(), // Disabled - port conflict
    nitro(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  define: {
    __BUILD_VERSION__: JSON.stringify(gitInfo.commit),
    __BUILD_TIME__: JSON.stringify(buildTime),
    __BUILD_BRANCH__: JSON.stringify(gitInfo.branch),
  },
  build: {
    // Cache busting: Vite adds content hashes by default
    // This ensures proper cache invalidation
    rollupOptions: {
      output: {
        // Include hash in filenames for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})

export default config
