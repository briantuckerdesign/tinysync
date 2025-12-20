#!/usr/bin/env bun
import { existsSync, mkdirSync, rmSync } from 'fs'
import { copyFile, readFile, writeFile } from 'fs/promises'

export async function runBuild() {
    const outDir = '../docs'

    // Clean docs directory
    if (existsSync(outDir)) {
        rmSync(outDir, { recursive: true })
    }
    mkdirSync(outDir)

    // Build TypeScript bundle
    await Bun.build({
        entrypoints: ['./src/main.ts'],
        outdir: outDir,
        target: 'browser',
        minify: true,
        naming: '[name].js',
    })

    // Copy CSS
    await copyFile('styles.css', `${outDir}/styles.css`)

    // Copy favicon
    await copyFile('favicon.ico', `${outDir}/favicon.ico`)

    // Copy HTML with updated script reference
    const html = await readFile('index.html', 'utf-8')
    const updatedHtml = html.replace(
        '<script type="module" src="./src/main.ts"></script>',
        '<script src="./main.js"></script>'
    )
    await writeFile(`${outDir}/index.html`, updatedHtml)

    // Copy .nojekyll for GitHub Pages
    if (existsSync('.nojekyll')) {
        await copyFile('.nojekyll', `${outDir}/.nojekyll`)
    }

    console.log('✓ Build complete! Output in ../docs/')
}
