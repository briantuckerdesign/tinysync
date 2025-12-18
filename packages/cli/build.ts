#!/usr/bin/env bun
/**
 * Build script for @tinysync/cli
 *
 * Creates a bundled executable using Bun's bundler.
 * The output can be run with `bun dist/cli.js` or compiled to a binary.
 */

import { $ } from 'bun'
import { mkdir } from 'fs/promises'

const startTime = performance.now()

console.log('🔨 Building @tinysync/cli...\n')

// Clean the dist directory
await $`rm -rf dist`

// Bundle the CLI (for npm distribution)
const result = await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    target: 'bun',
    minify: false, // Keep readable for debugging; set to true for production
    sourcemap: 'external',
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

const bundleTime = performance.now()
console.log(`\n✅ Bundle completed in ${(bundleTime - startTime).toFixed(0)}ms`)

console.log('\n💡 To run the bundled CLI:')
console.log('   bun dist/index.js')

/* --------------------------------- Binaries --------------------------------- */
console.log('\n🔨 Building platform binaries...\n')

type Platform = 'darwin' | 'linux' | 'windows'
type Arch = 'arm64' | 'x64'

interface BinaryTarget {
    platform: Platform
    arch: Arch
    target: `bun-${Platform}-${Arch}`
    dir: string
    ext: string
}

const targets: BinaryTarget[] = [
    // macOS
    {
        platform: 'darwin',
        arch: 'arm64',
        target: 'bun-darwin-arm64',
        dir: 'mac/arm64',
        ext: '',
    },
    {
        platform: 'darwin',
        arch: 'x64',
        target: 'bun-darwin-x64',
        dir: 'mac/x64',
        ext: '',
    },
    // Linux
    {
        platform: 'linux',
        arch: 'arm64',
        target: 'bun-linux-arm64',
        dir: 'linux/arm64',
        ext: '',
    },
    {
        platform: 'linux',
        arch: 'x64',
        target: 'bun-linux-x64',
        dir: 'linux/x64',
        ext: '',
    },
    // Windows
    {
        platform: 'windows',
        arch: 'x64',
        target: 'bun-windows-x64',
        dir: 'windows/x64',
        ext: '.exe',
    },
]

const baseOptions = {
    entrypoints: ['./src/index.ts'],
    minify: true,
    sourcemap: 'linked' as const,
}

const localDefines = {
    define: {
        'process.env.NODE_TLS_REJECT_UNAUTHORIZED': JSON.stringify('0'),
    },
}

// Create output directories
await Promise.all(
    targets.map((t) => mkdir(`./dist/${t.dir}`, { recursive: true }))
)

// Build function with error handling
async function buildBinary(
    target: BinaryTarget,
    isLocal: boolean
): Promise<{ success: boolean; name: string; error?: string }> {
    if (target.target === 'bun-windows-arm64')
        return {
            success: false,
            name: 'bun-windows-arm64',
            error: 'Windows ARM64 is not supported',
        }

    const name = isLocal
        ? `tinysync-local${target.ext}`
        : `tinysync${target.ext}`
    const outfile = `./dist/${target.dir}/${name}`

    try {
        const result = await Bun.build({
            ...baseOptions,
            ...(isLocal ? localDefines : {}),
            compile: {
                target: target.target,
                outfile,
            },
        })

        if (!result.success) {
            return {
                success: false,
                name: `${target.platform}-${target.arch}${isLocal ? '-local' : ''}`,
                error: result.logs.map((l) => l.message).join(', '),
            }
        }

        return {
            success: true,
            name: `${target.platform}-${target.arch}${isLocal ? '-local' : ''}`,
        }
    } catch (err) {
        return {
            success: false,
            name: `${target.platform}-${target.arch}${isLocal ? '-local' : ''}`,
            error: err instanceof Error ? err.message : String(err),
        }
    }
}

// Build all binaries in parallel
const buildPromises = targets.flatMap((target) => [
    buildBinary(target, false),
    buildBinary(target, true),
])

const results = await Promise.all(buildPromises)

// Report results
const successful = results.filter((r) => r.success)
const failed = results.filter((r) => !r.success)

console.log(`📦 Binaries built: ${successful.length}/${results.length}`)
for (const result of successful) {
    console.log(`   ✅ ${result.name}`)
}

if (failed.length > 0) {
    console.log('\n⚠️  Failed builds:')
    for (const result of failed) {
        console.log(`   ❌ ${result.name}: ${result.error}`)
    }
}

const endTime = performance.now()
console.log(
    `\n✅ All builds completed in ${(endTime - startTime).toFixed(0)}ms`
)
