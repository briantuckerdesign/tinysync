import { manageSyncs } from '..'
import type { Sync } from '../../../../../core/types'
import { state } from '../../../../state'
import { syncsDir } from '../../../../syncs'
import { saveSyncs } from '../../../../syncs/save'
import { ui } from '../../../../ui'
import { manageSync } from '.'

export async function deleteSync(sync: Sync) {
    try {
        // Confirm deletion
        const shallWeContinue = await ui.prompt.confirm({
            message: `Are you sure you want to delete ${ui.format.bold(sync.name)}?`,
        })

        if (ui.prompt.isCancel(shallWeContinue) || !shallWeContinue)
            return await manageSync(sync)

        // Remove sync from state
        state.syncs = state.syncs.filter((s) => s.id !== sync.id)

        // Delete the sync JSON file
        const filePath = syncsDir + sync.id + '.json'
        const file = Bun.file(filePath)
        const exists = await file.exists()

        if (exists) {
            await Bun.write(filePath, '')
            // Delete the empty file
            await (async () => {
                const proc = Bun.spawn(['rm', filePath])
                await proc.exited
            })()
        }

        // Save the updated state
        await saveSyncs()

        ui.prompt.log.success('✅ Sync deleted!')
    } catch (error) {
        ui.prompt.log.error('Error deleting sync.')
    } finally {
        return await manageSyncs()
    }
}
