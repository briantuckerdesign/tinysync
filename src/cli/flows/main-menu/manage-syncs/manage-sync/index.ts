// import { AsciiTable3 } from 'ascii-table3'
import { manageSyncs } from '..'
import { tinySync } from '../../../../../core'
import { createSyncEmitter } from '../../../../../core/sync/emitter'
import type { Sync } from '../../../../../core/types'
import { ui } from '../../../../ui'
import { deleteSync } from './delete-sync'
import { validateSyncTokens } from './validate-sync-tokens'
import { viewSyncDetails } from './view-sync-details'

export async function manageSync(sync: Sync) {
    try {
        // Validate that the sync's tokens still exist in state
        const tokens = await validateSyncTokens(sync)
        if (!tokens) return await manageSyncs()

        ui.prompt.log.info(`💎 ${ui.format.bold(sync.name)}`)
        const syncMessage = 'What would you like to do?'
        const syncChoices = [
            {
                label: 'Sync',
                value: 'runSync',
            },
            {
                label: 'View details',
                value: 'viewDetails',
            },
            { label: 'Publish site', value: 'publishSite' },
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
                const emitter = createSyncEmitter()

                emitter.on('progress', ({ step, message }) => {
                    ui.prompt.log.info(`[${step}] ${message}`)
                })

                emitter.on('error', ({ step, error, fatal }) => {
                    ui.prompt.log.error(
                        `[${step}] ${fatal ? 'FATAL' : 'Warning'}: ${error.message}`
                    )
                })

                emitter.on('complete', ({ timeElapsed, summary }) => {
                    ui.prompt.log.success(
                        `✅ Sync completed in ${timeElapsed}s`
                    )
                    ui.prompt.log.success(
                        `   Created: ${summary.created}, Updated: ${summary.updated}, Deleted: ${summary.deleted}, Failed: ${summary.failed}`
                    )
                })

                await tinySync.sync(
                    sync,
                    tokens.airtable,
                    tokens.webflow,
                    emitter
                )
                return await manageSync(sync)
            case 'viewDetails':
                await viewSyncDetails(sync)
                break
            case 'publishSite':
                await tinySync.publishSite(
                    tokens.webflow,
                    sync.config.webflow.site.id
                )
                return await manageSync(sync)
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
