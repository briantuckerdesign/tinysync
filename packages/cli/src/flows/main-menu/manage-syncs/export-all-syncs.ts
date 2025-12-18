import type { Sync } from '@tinysync/core'
import { state } from '../../../state'
import { ui } from '../../../ui'
import { manageSyncs } from '.'
import path from 'path'

export async function exportAllSyncs() {
    try {
        const syncs = (state.syncs || []) as Sync[]

        if (syncs.length === 0) {
            ui.prompt.log.warn('No syncs to export.')
            return await manageSyncs()
        }

        // Prompt for directory path
        const directory = await ui.prompt.text({
            message: 'Enter the directory path to export the syncs to',
            placeholder: process.cwd(),
        })
        await ui.handleCancel(directory, manageSyncs)

        if (!directory || typeof directory !== 'string') {
            ui.prompt.log.error('Invalid directory path.')
            return await manageSyncs()
        }

        // Resolve the directory path (handle ~ and relative paths)
        let resolvedDir = directory.trim()
        if (resolvedDir.startsWith('~')) {
            resolvedDir = resolvedDir.replace('~', process.env.HOME || '')
        }
        resolvedDir = path.resolve(resolvedDir)

        // Create copies of all syncs without the tokens property
        const syncsWithoutTokens = syncs.map((sync) => {
            const { tokens, ...syncWithoutTokens } = sync
            return syncWithoutTokens
        })

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const fileName = `tinysync-export-${timestamp}.json`
        const filePath = path.join(resolvedDir, fileName)

        // Write the syncs array to the file
        await Bun.write(filePath, JSON.stringify(syncsWithoutTokens, null, 2))

        ui.prompt.log.success(
            `Exported ${ui.format.bold(String(syncs.length))} sync(s) to ${ui.format.bold(filePath)}`
        )
        return await manageSyncs()
    } catch (error) {
        ui.prompt.log.error(
            'Error exporting syncs. Make sure the directory exists.'
        )
        return await manageSyncs()
    }
}
