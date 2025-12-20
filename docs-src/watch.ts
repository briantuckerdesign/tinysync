#!/usr/bin/env bun
import { watch } from 'fs'
import { runBuild } from './build'

console.log('Building...')
await runBuild()
console.log('✓ Initial build complete! Watching for changes...\n')

// Watch for changes
const watcher = watch('./', { recursive: true }, async (event, filename) => {
    console.log(`\n${event} detected in ${filename}`)
    await runBuild()
})

// Handle cleanup on exit
process.on('SIGINT', () => {
    console.log('\n\nStopping dev server...')
    watcher.close()
    process.exit(0)
})
