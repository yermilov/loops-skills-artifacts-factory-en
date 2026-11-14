import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import viteImagemin from 'vite-plugin-imagemin'

/** Offline mode: writes dist/sw.js from scripts/sw.template.js with the list of
 *  EVERY file of the build, so the first visit downloads the whole deck and it
 *  keeps working with no internet. The page registers it in src/utils/offline.ts. */
function offline(): Plugin {
  let outDir = 'dist'
  return {
    name: 'deck-offline',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle: {
      order: 'post',
      sequential: true,
      handler() {
        const files: string[] = []
        const walk = (dir: string) => {
          for (const name of readdirSync(dir)) {
            const path = join(dir, name)
            if (statSync(path).isDirectory()) walk(path)
            else files.push(relative(outDir, path).split('\\').join('/'))
          }
        }
        walk(outDir)
        // The PDF is the organisers' copy, not part of the talk; sw.js is this file.
        const precache = files.filter((f) => f !== 'sw.js' && !f.endsWith('.pdf')).sort()
        const hash = createHash('sha256')
        for (const f of precache) hash.update(f)
        hash.update(readFileSync(join(outDir, 'index.html')))
        const sw = readFileSync(resolve(__dirname, 'scripts/sw.template.js'), 'utf8')
          .replace("const VERSION = '__VERSION__'", () => `const VERSION = '${hash.digest('hex').slice(0, 12)}'`)
          .replace('const FILES = __FILES__', () => `const FILES = ${JSON.stringify(precache)}`)
        if (sw.includes("'__VERSION__'") || sw.includes('= __FILES__')) throw new Error('deck-offline: placeholders not filled')
        writeFileSync(join(outDir, 'sw.js'), sw)
        console.log(`deck-offline: sw.js precaches ${precache.length} files`)
      },
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    viteImagemin({
      optipng: { optimizationLevel: 7 },
      pngquant: { quality: [0.65, 0.9], speed: 4 },
      mozjpeg: { quality: 75 },
      gifsicle: { optimizationLevel: 3 },
      svgo: { plugins: [{ removeViewBox: false }] },
    }),
    offline(),
  ],
  base: '/loops-skills-artifacts-factory-en/',
})
