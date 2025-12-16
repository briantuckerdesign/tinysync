import { mainMenu } from '..'
import type { Sync } from '@tinysync/core'
import { state } from '../../../state'
import { ui } from '../../../ui'
import { createSync } from './create-sync'
import { manageSync } from './manage-sync'

export async function manageSyncs() {
    try {
        const syncs = (state.syncs || []) as Sync[]

        // Formats syncs for select prompt
        const choices = syncs.map((sync) => {
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
