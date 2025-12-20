#!/usr/bin/env bun
import { existsSync, mkdirSync, rmSync, watch } from 'fs'
import { copyFile, readFile, writeFile } from 'fs/promises'

// Clean and create dist directory
if (existsSync('dist')) {
    rmSync('dist', { recursive: true })
}
mkdirSync('dist')

async function buildTS() {
    await Bun.build({
        entrypoints: ['./src/main.ts'],
        outdir: './dist',
        target: 'browser',
        naming: '[name].js',
    })
    console.log('✓ TypeScript rebuilt')
}

async function copyCSS() {
    await copyFile('styles.css', 'dist/styles.css')
    console.log('✓ CSS copied')
}

async function copyHTML() {
    const html = await readFile('index.html', 'utf-8')
    const updatedHtml = html.replace(
        '<script type="module" src="./src/main.ts"></script>',
        '<script type="module" src="./main.js"></script>'
    )
    await writeFile('dist/index.html', updatedHtml)
    console.log('✓ HTML copied')
}

async function copyNojekyll() {
    if (existsSync('.nojekyll')) {
        await copyFile('.nojekyll', 'dist/.nojekyll')
    }
}

// Initial build
console.log('Building...')
await buildTS()
await copyCSS()
await copyHTML()
await copyNojekyll()
console.log('✓ Initial build complete! Watching for changes...\n')

// Watch for changes
const srcWatcher = watch('./src', { recursive: true }, async (event, filename) => {
    if (filename?.endsWith('.ts')) {
        console.log(`\nChange detected in ${filename}`)
        await buildTS()
    }
})

const htmlWatcher = watch('./index.html', async (event, filename) => {
    console.log(`\nChange detected in index.html`)
    await copyHTML()
})

const cssWatcher = watch('./styles.css', async (event, filename) => {
    console.log(`\nChange detected in styles.css`)
    await copyCSS()
})

// Handle cleanup on exit
process.on('SIGINT', () => {
    console.log('\n\nStopping dev server...')
    srcWatcher.close()
    htmlWatcher.close()
    cssWatcher.close()
    process.exit(0)
})
