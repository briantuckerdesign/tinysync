// import { AsciiTable3 } from 'ascii-table3'
import { tinysync, type Sync } from '@tinysync/core'
import { manageSyncs } from '..'
import { createClackProgressEmitter, ui } from '../../../../ui'
import { deleteSync } from './delete-sync'
import { exportSync } from './export-sync'
import { toggleVerboseLogs } from './toggle-verbose-logs'
import { validateSyncTokens } from './validate-sync-tokens'
import { viewSyncDetails } from './view-sync-details'
import { saveVerboseLogs } from './save-verbose-logs'

export async function manageSync(sync: Sync) {
    try {
        // Validate that the sync's tokens still exist in state
        const tokens = await validateSyncTokens(sync)
        if (!tokens) return await manageSyncs()

        ui.prompt.log.info(`💎 ${ui.format.bold(sync.name)}`)
        const syncMessage = 'What would you like to do?'
        const verboseLabel = sync.config.verboseLogs
            ? 'Verbose logs: ✓ enabled'
            : 'Verbose logs: ✗ disabled'
        const syncChoices = [
            {
                label: 'Sync',
                value: 'runSync',
            },
            {
                label: 'View details',
                value: 'viewDetails',
            },
            {
                label: verboseLabel,
                value: 'toggleVerboseLogs',
                hint: 'Toggle JSON logging',
            },
            {
                label: 'Export sync',
                value: 'exportSync',
            },
            { label: 'Delete sync', value: 'deleteSync' },
            { label: 'Back', value: 'back' },
            { label: 'Exit', value: 'exit' },
        ]

        // Asks user what they want to do with the selected sync
        const userChoice = await ui.prompt.select({
            message: syncMessage,
            options: syncChoices,
        })
        await ui.handleCancel(userChoice, manageSyncs)

        switch (userChoice) {
            case 'runSync':
                const clack = createClackProgressEmitter({
                    onVerboseLogs: (logs) => saveVerboseLogs(sync, logs),
                })
                clack.start()

                await tinysync.sync(
                    sync,
                    tokens.airtable,
                    tokens.webflow,
                    clack.emitter
                )
                return await manageSync(sync)
            case 'viewDetails':
                await viewSyncDetails(sync)
                break
            case 'toggleVerboseLogs':
                await toggleVerboseLogs(sync)
                break
            case 'exportSync':
                await exportSync(sync)
                break
            case 'deleteSync':
                await deleteSync(sync)
                break
            case 'back':
                return await manageSyncs()
            case 'exit':
                ui.prompt.outro('See ya later! 👋')
                process.exit()
            default:
                return await manageSyncs()
        }
    } catch (error) {
        console.error(error)
        ui.prompt.log.error('Error managing sync.')
        return await manageSyncs()
    }
}
