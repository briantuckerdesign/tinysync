#!/usr/bin/env bun
import { existsSync, mkdirSync, rmSync } from 'fs'
import { copyFile, readFile, writeFile } from 'fs/promises'

// Clean dist directory
if (existsSync('dist')) {
    rmSync('dist', { recursive: true })
}
mkdirSync('dist')

// Build TypeScript bundle
await Bun.build({
    entrypoints: ['./src/main.ts'],
    outdir: './dist',
    target: 'browser',
    minify: true,
    naming: '[name].js',
})

// Copy CSS
await copyFile('styles.css', 'dist/styles.css')

// Copy favicon
await copyFile('favicon.ico', 'dist/favicon.ico')

// Copy HTML with updated script reference
const html = await readFile('index.html', 'utf-8')
const updatedHtml = html.replace(
    '<script type="module" src="./src/main.ts"></script>',
    '<script type="module" src="./main.js"></script>'
)
await writeFile('dist/index.html', updatedHtml)

// Copy .nojekyll for GitHub Pages
if (existsSync('.nojekyll')) {
    await copyFile('.nojekyll', 'dist/.nojekyll')
}

console.log('✓ Build complete! Output in dist/')
