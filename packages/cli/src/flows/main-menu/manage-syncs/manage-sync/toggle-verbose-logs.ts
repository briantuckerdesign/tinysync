import { manageSync } from '.'
import { ui } from '../../../../ui'
import { saveSyncs } from '../../../../syncs/save'
import { state } from '../../../../state'
import type { Sync } from '@tinysync/core'

export async function toggleVerboseLogs(sync: Sync) {
    try {
        const currentValue = sync.config.verboseLogs ?? false

        const confirm = await ui.prompt.confirm({
            message: `Verbose logging is currently ${currentValue ? 'enabled' : 'disabled'}. ${currentValue ? 'Disable' : 'Enable'} it?`,
        })
        await ui.handleCancel(confirm, () => manageSync(sync))

        if (confirm) {
            // Update the sync config
            sync.config.verboseLogs = !currentValue

            // Update state
            const syncIndex = state.syncs.findIndex((s) => s.id === sync.id)
            if (syncIndex !== -1) {
                state.syncs[syncIndex] = sync
            }

            // Save to disk
            const saved = await saveSyncs()
            if (saved) {
                ui.prompt.log.success(
                    `Verbose logging ${!currentValue ? 'enabled' : 'disabled'}.`
                )
            } else {
                ui.prompt.log.error('Failed to save sync settings.')
            }
        }
    } catch (error) {
        ui.prompt.log.error('Error toggling verbose logging.')
    } finally {
        return await manageSync(sync)
    }
}
