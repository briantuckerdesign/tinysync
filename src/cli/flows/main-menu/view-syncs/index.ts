import { state } from '../../../state'
import { ui } from '../../../ui'
import { createSync } from '../create-sync'
import { viewSync } from './view-sync'

/**
 * 1. Create array of syncs from config
 * 2. Add additional options to array
 * 3. Ask user how to proceed
 * 4. Execute selected option
 */
export async function viewSyncs() {
    try {
        const syncs = (state.config.syncs || []) as Sync[]

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
            message: ui.format.bold('🔍 View syncs'),
            options: choices,
        })
        await ui.handleCancel(selectedSync)

        switch (selectedSync) {
            case 'back':
                break
            case 'exit':
                ui.prompt.outro('See ya later! 👋')
                process.exit()
            case 'createSync':
                await createSync()
                break
            default:
                state.config.selectedSync = selectedSync as Sync
                await viewSync()
                break
        }
    } catch (error) {
        ui.prompt.log.error('Error viewing syncs.')
        return
    }
}
