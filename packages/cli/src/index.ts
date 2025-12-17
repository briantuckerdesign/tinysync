#!/usr/bin/env bun
/**
 * @tinysync/cli entry point
 *
 * Interactive CLI for managing Airtable → Webflow syncs.
 * Run with `tinysync` after global installation or `bun src/index.ts` for development.
 *
 * Commands:
 *   tinysync         - Run the CLI normally
 *   tinysync local   - Run with TLS verification disabled (for corporate VPNs)
 *   tinysync --help  - Show help message
 */
import pack from '../package.json'
import { ui } from './ui'
import { login } from './flows/login'
import { mainMenu } from './flows/main-menu'
import { ensureDataDirs } from './utils/paths'

// Parse CLI arguments
const args = process.argv.slice(2)
const command = args[0]

// Handle --help flag
if (command === '--help' || command === '-h') {
    console.log(`
tinysync v${pack.version}

Usage:
  tinysync          Run the CLI normally
  tinysync local    Run with TLS verification disabled (for corporate VPNs)
  tinysync --help   Show this help message

Note: The 'local' command disables TLS certificate verification.
      Only use this if you're behind a corporate VPN that causes certificate issues.
`)
    process.exit(0)
}

// Handle 'local' command - disable TLS verification for corporate VPNs
if (command === 'local') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    console.log('⚠️  TLS verification disabled (local mode)\n')
}

;(async () => {
    try {
        // Ensure data directories exist before any file operations
        ensureDataDirs()

        await ui.welcome()

        ui.prompt.intro(ui.format.dim(`tinysync CLI v${pack.version}`))

        await login()

        await mainMenu()

        ui.prompt.outro(`See ya later! 👋`)
    } catch (error) {
        ui.prompt.log.error('There was an error running tinysync CLI.')
        ui.prompt.log.error(
            error instanceof Error ? error.message : String(error)
        )
        if (error instanceof Error && error.stack) {
            console.error(error.stack)
        }
    }
})()
