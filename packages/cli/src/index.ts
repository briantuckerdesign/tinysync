#!/usr/bin/env bun
/**
 * @tinysync/cli entry point
 *
 * Interactive CLI for managing Airtable → Webflow syncs.
 * Run with `tinysync` after global installation or `bun src/index.ts` for development.
 */
import pack from '../package.json'
import { ui } from './ui'
import { login } from './flows/login'
import { mainMenu } from './flows/main-menu'
import { ensureDataDirs } from './utils/paths'
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
