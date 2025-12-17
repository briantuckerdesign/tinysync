#!/usr/bin/env bun
/**
 * Build script for @tinysync/cli
 *
 * Creates a bundled executable using Bun's bundler.
 * The output can be run with `bun dist/cli.js` or compiled to a binary.
 */

import { $ } from 'bun'

const startTime = performance.now()

console.log('🔨 Building @tinysync/cli...\n')

// Clean the dist directory
await $`rm -rf dist`

// Bundle the CLI
const result = await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    target: 'bun', // Target Bun runtime
    minify: false, // Keep readable for debugging; set to true for production
    sourcemap: 'external', // Generate sourcemaps for debugging
    external: [
        // figlet loads font files dynamically at runtime, so it can't be bundled
        'figlet',
    ],
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
    },
})

if (!result.success) {
    console.error('❌ Build failed:')
    for (const log of result.logs) {
        console.error(log)
    }
    process.exit(1)
}

// Report build outputs
console.log('📦 Build outputs:')
for (const output of result.outputs) {
    const sizeKB = (output.size / 1024).toFixed(2)
    console.log(`   ${output.path} (${sizeKB} KB)`)
}

const endTime = performance.now()
console.log(`\n✅ Build completed in ${(endTime - startTime).toFixed(0)}ms`)

console.log('\n💡 To run the bundled CLI:')
console.log('   bun dist/index.js')
