import { mainMenu } from '..'
import type { Sync } from '@tinysync/core'
import { state } from '../../../state'
import { ui } from '../../../ui'
import { createSync } from './create-sync'
import { exportAllSyncs } from './export-all-syncs'
import { importSyncs } from './import-syncs'
import { manageSync } from './manage-sync'

export async function manageSyncs() {
    try {
        const syncs = (state.syncs || []) as Sync[]

        // Sort syncs alphabetically by name
        const sortedSyncs = [...syncs].sort((a, b) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        )

        // Formats syncs for select prompt
        const choices = sortedSyncs.map((sync) => {
            return {
                label: `💎 ${ui.format.bold(sync.name)}`,
                value: sync,
            }
        }) as any

        choices.push(
            {
                label: 'Create new sync',
                value: 'createSync',
            },
            {
                label: 'Import syncs',
                value: 'importSyncs',
                hint: 'Import from JSON file',
            },
            {
                label: 'Export all syncs',
                value: 'exportAllSyncs',
                hint: 'Export to JSON file',
            },
            {
                label: 'Back',
                value: 'back',
            },
            {
                label: 'Exit',
                value: 'exit',
            }
        )

        // Returns the selected sync
        const selectedSync = await ui.prompt.select({
            message: ui.format.bold('🔍 Manage syncs'),
            options: choices,
        })
        await ui.handleCancel(selectedSync, mainMenu)

        switch (selectedSync) {
            case 'back':
                return await mainMenu()
            case 'createSync':
                return await createSync()
            case 'importSyncs':
                return await importSyncs()
            case 'exportAllSyncs':
                return await exportAllSyncs()
            case 'exit':
                ui.prompt.outro('See ya later! 👋')
                process.exit(0)
            default:
                return await manageSync(selectedSync as Sync)
        }
    } catch (error) {
        ui.prompt.log.error('Error managing syncs.')
        return await mainMenu()
    }
}
